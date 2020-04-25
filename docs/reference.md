# Clumpy.js Reference

This page documents Clumpy, method by method. The examples are out of context and show only the invocation of the method. See the usage guide for more information on how to use these methods together.

* [Constructor](#constructor)

* [Looping Actions](#looping)
  * [for_loop](#for_loop)
  * [for_in_loop](#for_in_loop)
  * [while_loop](#while_loop)
  * [do_while_loop](#do_while_loop)

* [Loop Control](#control)
  * [break_loop](#break_loop)
  * [continue_loop](#continue_loop)
  * [label](#label)

* [Single Actions](#singles)
  * [interrupt](#interrupt)
  * [set](#set)
  * [sleep](#sleep)
  * [then](#then)
  * [wait](#wait)

* [External Control](#external)
  * [init](#init)
  * [pause](#pause)
  * [resume](#resume)
  * [setNow](#setNow)

  
<a name="constructor"></a>
## Constructor

### `new Clumpy(options)`
> Creates a new Clumpy instance.
> 
> Parameter | Default | Description
> --- | --- | ---
> `options.between`  | `null` | A function to call between clumps.
> `options.delay`    | `0`    | The number of milliseconds to rest between clumps.
> `options.duration` | `100`  | The maximum number of milliseconds each clump is allowed to run.
> 
> **Example**
> ```javascript
> // Defaults:
> var clumpy = new Clumpy();
> 
> // With Options Specified:
> var clumpy = new Clumpy({
>   between: function () {
>     console.log('Moving right along...');
>   },
>   // Devote equal time to processing and resting:
>   delay: 50,
>   duration: 50
> });
> ```

<a name="looping"></a>
## Looping Actions

The following methods model looping statements.

<a name="for_loop"></a>
### `for_loop(init, test, inc, statements)`
> Enqueue an action that models a `for` loop.
>
> Parameter | Description
> --- | ---
> `init` | A function that initializes the loop.
> `test` | A function that returns the result of the condition for the loop.
> `inc` | A function that increments the loop.
> `statements` | A function that performs one iteration of the loop’s body.
> 
> *All parameters are required.*
>
> **Example**
> ```javascript
> // Real Loop
> for (i = 0; i < 10; i += 1) {
>   console.log(i);
> }
> 
> // Clumpy Equivalent
> clumpy.for_loop(
>   function () { i = 0; },
>   function () { return i < 10; },
>   function () { i += 1; },
>   function () {
>     console.log(i);
>   }
> );
> ```

<a name="for_in_loop"></a>
### `for_in_loop(getObject, statements)`
> Enqueue an action that models a `for...in` loop.
> 
> Parameter | Description
> --- | ---
> `getObject` | A function that returns the object over which to iterate.
> `statements` | A function that performs one iteration of the loop’s body. It should accept an argument representing the key for the current loop iteration.
> 
> *Both parameters are required.*
> 
> **Example**
> ```javascript
> // Real Loop
> for (key in object) {
>   console.log(key + ': ' + object[key]);
> }
> 
> // Clumpy Equivalent
> clumpy.for_in_loop(
>   function () { return object; },
>   function (k) {
>     key = k;
>     console.log(key + ': ' + object[key]);
>   }
> );
> ```
> 
> The scratch variable `k` in the example above is for mimicking the scope key has in the real loop. If you don’t need to access the variable from outside the statements function, you can use its argument directly:
> 
> ```javascript
> clumpy.for_in_loop(
>   function () { return object; },
>   function (key) {
>     console.log(key + ': ' + object[key]);
>   }
> );
> ```

<a name="while_loop"></a>
### `while_loop(test, statements)`
> Enqueue an action that models a `while` loop.
> 
> Parameter | Description
> --- | ---
> `test` | A function that returns the result of the condition for the loop.
> `statements` | A function that performs one iteration of the loop’s body.
> 
> **Example**
> ```javascript
> // Real Loop
> while (i < 10) {
>   console.log(i);
>   i += 1;
> }
> 
> // Clumpy Equivalent
> clumpy.while_loop(
>   function () { return i < 10; },
>   function () {
>     console.log(i);
>     i += 1;
>   }
> );
> ```

<a name="do_while_loop"></a>
### `do_while_loop(statements, test)`
> Enqueue an action that models a `do...while` loop.
> 
> Parameter | Description
> --- | ---
> `statements` | A function that performs one iteration of the loop’s body.
> `test` | A function that returns the result of the condition for the loop.
> 
> *Both parameters are required.*
> 
> **Example**
> ```javascript
> // Real Loop
> do {
>   console.log(i);
>   i += 1;
> } while (i < 10);
> 
> // Clumpy Equivalent
> clumpy.do_while_loop(
>   function () {
>     console.log(i);
>     i += 1;
>   },
>   function () { return i < 10; }
> );
> ```

<a name="control"></a>
## Loop Control

The following methods emulate `break`, `continue`, and label statements, for modifying the flow of loops.

<a name="break_loop"></a>
### `break_loop(label)`
> Break the closest loop with the specified label, or the current loop if no label is given.
>
> Parameter | Default | Description
> --- | --- | ---
> `label` | `undefined` | The label of the loop to break.

<a name="continue_loop"></a>
### `continue_loop(label)`
> Continue the closest loop with the specified label, or the current loop if no label is given.
>
> Parameter | Default | Description
> --- | --- | ---
> `label` | `undefined` | The label of the loop to continue.

<a name="label"></a>
### `label(name)`
> Assign a label to the next action enqueued, if the action is a loop. If the next action is not a loop, the label is discarded.
> 
> Parameter | Description
> --- | ---
> `name` *(required)* | The string to assign as the label.


<a name="singles"></a>
## Single Actions

The following methods enqueue actions that aren't loops.

<a name="interrupt"></a>
### `interrupt()`
> Enqueue an end to the clump that’s running at the time the interrupt is dequeued.

<a name="set"></a>
### `set(options)`
> Enqueue the act of setting one or more options for this Clumpy instance. Contrast this with `setNow` below, which sets the options immediately at the time the method is called.
> 
> The `options` object can have the same properties as the `Clumpy` [constructor](#constructor).

<a name="sleep"></a>
### `sleep(delay)`
> Enqueue a sleep of `delay` milliseconds before deueueing the next action.
> 
> Parameter | Description
> --- | ---
> `delay` *(required)* | The number of milliseconds to sleep.

<a name="then"></a>
### `then(statements)`
> Enqueue the `statements` function to be called a single time.
> 
> Parameter | Description
> --- | ---
> `statements` *(required)* | The function to invoke.

<a name="wait"></a>
### `wait(statements)`
> Enqueue an outside asynchronous operation and wait until that operation completes before dequeueing the next action.
> 
> Parameter | Description
> --- | ---
> `statements` *(required)* | The function to call. It should accept a function as an argument (`done` in the example below), and invoke that function as a callback when the task is complete.
>
> **Example**
> ```javascript
> (clumpy
>   .while_loop(
>     // snip
>   )
>   .wait(function (done) {
>     jQuery.get('/example/async/', function (data) {
>       console.log('Got Data: ' + data);
>       done();
>     });
>   })
>   .for_loop(
>     // snip
>   )
> );
> ```


<a name="external"></a>
## External Control

The following methods act immediately instead of enqueueing actions. They are for external control over a Clumpy instance, and should generally not be used inside enqueued actions.

<a name="init"></a>
### `init()`
> Stop this Clumpy instance immediately and discard all of its enqueued actions.

<a name="pause"></a>
### `pause()`
> Stops execution immediately until `resume` is called.

<a name="resume"></a>
### `resume()`
> Resumes execution after pause().

<a name="setNow"></a>
### `setNow(options)`
> Set options for this Clumpy instance immediately. Contrast this with `set` above, which doesn’t set the options immediately, but enqueues the act of setting the options.
> 
> The `options` object can have the same properties as the `Clumpy` [constructor](#constructor).

