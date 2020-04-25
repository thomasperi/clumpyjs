{% include nav.html %}

# Implementation

This page is for people who are interested in how Clumpy does its thing behind the scenes. If you want to learn how to use Clumpy, try the [Usage Guide](./).

The center of what makes Clumpy work is an interplay between two queues: the browser's event queue, and Clumpy's own internal queue.

## The Browser's Event Queue

Here's a boiled-down version of how timing and synchronization work in JavaScript in a browser: Whenever you have a page open in a browser, it's constantly going through this cycle:

1. **Dequeue** a function call from the event queue and perform it. The execution of this stage is called a "code unit." The function might call other functions in turn. These calls are part of the same code unit.

2. **Update** the user interface: Make sure the screen reflects the state of the document, and collect information about what the user has done since the last time that information got collected.

Either stage in the cycle can push new code units onto the end of the event queue:

1. While executing JavaScript code, if there's an instruction that starts an asynchronous operation (e.g. an AJAX request or `setTimeout`) the browser waits until that operation is complete, and then pushes the operation's callback function onto the event queue. (In the case of `setTimeout`, the async operation is the act of waiting, and the "callback" is the function.)

2. While collecting UI information, if the browser determines that an event has occurred that has a listener registered, it pushes the listener function onto the event queue.

If any code unit runs too long before its outermost function call returns, it prevents the browser from updating the UI, causing it to hang, unresponsive.

## Clumpy's Queue

Clumpy's job is to mete out JavaScript code to the browser's event queue evenly, so that UI updates are frequent and consistent. To that end, Clumpy maintains its own queue of functions waiting to get sent to the browser's event queue. When you invoke a Clumpy method, Clumpy doesn't perform that action immediately, nor does it push it directly onto the browser's event queue. Instead, it enqueues the action as a node in its own internal queue.

A node in Clumpy's queue encompasses more information than just the function that will ultimately get sent to the browser's event queue. Because it can be either a loop such as `for_loop`, or a one-off action such as `then`, each node has to know which of those things it is. If it's a loop, it also has to keep track of whether it has begun looping, and whether it's finished looping.

But all nodes have one thing in common: they each have a `statements` function, which is the base action that the node performs.

## Iterations

An iteration is a single operation on a node. For a one-off node, an iteration just means invoking the node's `statements` function.

For a node that's a loop, an iteration is more complex.

1. First, if the loop hasn't been initialized yet, its `init` function gets invoked.

2. Next, regardless of whether it was already initialized, its `test` function gets invoked.

3. Finally, if `test` returned `true`, then the loop's `statements` function gets invoked. Otherwise, the loop gets marked as `done`.

After each iteration, Clumpy "advances" which can mean one of two things:

* For one-off nodes, and for loops that are `done`, advancing just means moving on to the next node in the queue.

* For loop nodes that haven't finished yet, advancing means staying on the current node but calling the loop's `inc` function to increment the counter.

## Clumps and Scheduling

A "clump" is the act of performing as many iterations as possible within the time limit specified by the `duration` option. To perform a clump, Clumpy checks the time and starts performing iterations. When the time limit is up, it stops performing iterations and schedules another clump.

"Scheduling" just refers to the act of putting a clump into the browser's event queue. Clumpy does that by calling setTimeout using the Clumpy `delay` option. When it's done with one clump, it schedules the next one, until Clumpy's queue is empty.

## Nesting

Up until now, I've referred to Clumpy's queue in the singular, as if there were only one. But in fact, when you start nesting loops, the queue becomes a stack of queues, with the top queue representing the innermost chain.

But before I can talk about how the stack works, I have to clarify one point about the order in which things happen. A chain's nodes are enqueued at the time that the chain's method calls are invoked. However, the statements function of each node, by design, waits to execute until its turn comes in the browser's event queue. What this means is that a chain nested inside a statements function will not add nodes to Clumpy's queue until the enclosing statements function has been invoked. This calls for an example.

```javascript
var i, j, clumpy;
clumpy = new Clumpy();
(clumpy
  .for_loop( /* [A] */
    function () { i = 0; },
    function () { return i < 10; },
    function () { i += 1; },
    function () { /* [C] */
      (clumpy
        .for_loop( /* [D] */
          function () { j = 0; },
          function () { return j < 10; },
          function () { j += 1; },
          function () {
            output(i + ', ' + j);
          }
        )
      );
    }
  )
  .then( /* [B] */
    function () {
      output('done');
    }
  )
);
```

What happens is this:

1. A code unit begins and the code above is executed.

2. The `for_loop` method [A] is invoked, enqueuing a loop node. Since it's the first thing in the queue, Clumpy schedules a clump, using setTimeout.

3. The `then` method [B] is invoked, enqueuing the then node.

4. The code unit exits. Both nodes are still in Clumpy's queue.

5. The scheduled clump works its way to the front of the browser's event queue, and is invoked as a new code unit.

6. The code unit starts iterating through the nodes, and the first `statements` function it encounters is [C].

7. Clumpy invokes [C] which calls `for_loop` [D], which enqueues a loop node.

But wait! What position does [D] take in the queue? Certainly not after [B], because everything inside [A] has to happen before [B] is allowed to start. But [B] is already in the queue, so how can [D] get in front of it?

This is where the stack comes in. Whenever a Clumpy method is called inside a statements block, that constitutes a nested chain. Clumpy uses its private instance variable `inside` to detect this, and reacts by stacking a new queue on top of the current one so that the inner loop takes precedence over the outer loop until the inner loop is `done`.

The top queue on the stack (the innermost loop encountered so far) has a reference to the queue underneath it on the stack (the loop that's just outside it), so that when it's `done`, Clumpy can back out of it and resume executing the outer loop.

Now, remember the part above about advancing? When a new queue is pushed onto the stack to accommodate a new node being pushed on, Clumpy now regards the new node as the current one. If Clumpy were to advance after the current iteration, it would advance right past the node that just got pushed on, and the node would never get processed. To account for that, every queue has to keep track of whether it has begun. When the time to advance comes along, Clumpy checks whether the queue has begun, and only advances if it has.

So, to continue from step 7 above, let's revise it:

7. [C] invokes `for_loop` [D]. Clumpy notices that this is the first one inside a `statements` function, and pushes a new queue onto the stack.

8. [D]'s node gets enqueued as the first in the queue.

9. Clumpy sees that this queue hasn't begun iterating yet, and knows not to advance on to the next node. The next iteration finds node [D].

10. Node [D] advances and iterates all the way through successfully and flags itself `done` when its `test` function finally returns `false`.

11. When the inner queue is `done`, Clumpy shifts focus back to the outer loop's queue and discards the inner one.

## Last Bits

Those are the main points. Everything else can be gleaned from the comments, but here are few things to get you started:

* Every method that enqueues a node delegates its responsibility to either `for_loop` or `then`. Those are the only two methods that enqueue.

* `sleep` looks a little mysterious, but if you first understand what `wait` does, `sleep` falls into place.
