{% include nav.html %}

# Intro

Clumpy lets you easily rewrite long-running synchronous loops as asynchronous operations, by breaking the operation into multiple smaller code units that yield control frequently enough that the browser doesn't hang. (This results in a slower loop, but a fluid user experience.)

You can write [incremental asynchronous processes](https://web.archive.org/web/20190323050823/http://www.julienlecomte.net/blog/2007/10/28/) without Clumpy, but Clumpy provides a way of structuring them like traditional loops, which lets you focus on your program without having to manage the code that chops it up.

It creates a managed chain of timeouts, promising to perform all the iterations in the proper order. The number of iterations performed in each single “clump” of execution is adjusted transparently to suit the speed of the computer executing the code. Execution can be paused and resumed from outside the loop.

