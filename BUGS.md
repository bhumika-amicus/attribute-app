## Bug A – div used as button



**Problem:** A `<div role="button">` was used instead of a real `<button>`.

**Observation:** The element was not reachable using the Tab key and did not activate with Enter or Space.

**Fix:** Replaced the `<div>` with a semantic `<button>` element, which provides keyboard accessibility by default.
Observe
❌ Press Tab → The div does not receive focus (unless tabindex="0" is added).
❌ Press Enter → Nothing happens.
❌ Press Space → Nothing happens.

![tab-on-edit](assets/image-3.png)


## Bug B – Icon-only button

![icon-screenshot](assets/image-6.png)

**Problem:** The Delete button only displayed a trash icon (`🗑️`) with no accessible text.

**Observation:** The screen reader did not announce a meaningful action, making it unclear that the button deletes an attribute.

**Fix:** Added a visually hidden `<span class="sr-only">Delete</span>` inside the button so screen readers announce "Delete" while only the icon remains visible.

### `.sr-only` Utility Class

The `.sr-only` class hides text visually while keeping it available to screen readers. It is useful for icon-only buttons that still need an accessible name.

```css
.sr-only {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
}
```


## Bug C – Two H1 Headings

**Problem:** A second `<h1>` heading was added to the page.

**Observation:** Lighthouse did not report an accessibility error, but having multiple primary headings can make the page structure less clear. Using a single `<h1>` with `<h2>` headings for sections provides a better document hierarchy.

**Fix:** Changed the second `<h1>` to `<h2>` to maintain a clear heading structure.


## Bug D – Label Not Associated with Input

**Problem:** The **Business Unit** label was not associated with its `<select>` because the `for` attribute was removed.

**Observation:** Before removing `for`, clicking the **Business Unit** label moved focus to the dropdown. After removing it, clicking the label no longer focused the dropdown, making it less accessible and harder to use.

**Fix:** Restored the `for="business-unit"` attribute on the label so it matched the `id="business-unit"` of the `<select>`. Clicking the label once again moved focus to the dropdown.



# CSS Assignment

# Bug A – Absolute Position Without a Positioned Ancestor

## Reproduction

An element with `position: absolute` was placed inside a container that used the default `position: static`.

```css
.toast {
    position: absolute;
    top: 0;
    right: 0;
}
```

## Observation

Instead of appearing in the top-right corner of its parent container, the toast was positioned relative to the page because no positioned ancestor existed.

## Fix

Added:

```css
.toast-container {
    position: relative;
}
```

This establishes the container as the containing block for the absolutely positioned child.

Alternatively, `position: fixed` can be used when the element should remain attached to the viewport.

# Bug C – Margin Collapsing

## Reproduction

A child element with `margin-top` was placed inside a parent without padding, border, or a new formatting context.

```css
.parent { }

.child {
    margin-top: 40px;
}
```

## Observation

The child's top margin collapsed with the parent's margin, causing the space to appear outside the parent instead of inside it.

## Fixes

### Method 1

```css
.parent {
    padding-top: 1px;
}
```

### Method 2

```css
.parent {
    border-top: 1px solid transparent;
}
```

### Method 3 (Recommended)

```css
.parent {
    display: flow-root;
}
```

## Why is `flow-root` the cleanest?

`display: flow-root` creates a new block formatting context, preventing margin collapsing without adding unnecessary padding or borders that could affect the layout or spacing.

# Bug D – Flex Child Overflow

## Reproduction

A flex child containing long or wide content overflowed its container because flex items default to `min-width: auto`.

## Observation

The flex item refused to shrink, causing the layout to overflow.

## Fix

In this project, the issue was prevented by applying:

```css
main,
#main-content {
    min-width: 0;
}
```

This allows the flex item to shrink within the available space, preventing overflow from wide tables or long content.

## Why?

Flex items default to `min-width: auto`, which protects their content from shrinking. Setting `min-width: 0` allows the flex item to shrink when needed, protecting the overall layout instead.

# JS Assignment bug fixes

## Task 17 

### Bug A: var closure-in-loop classic

**Problem:** Using `var` inside a `for` loop with an asynchronous function like `setTimeout` causes all iterations to share the same variable reference. By the time the timeout runs, the loop has finished and the variable is at its final value (3).
**Observation:** Expected `0, 1, 2` but the console printed `3, 3, 3`.

![bug using let](assets/BugA2.png)

**Fix:** Changed `var` to `let`. `let` is block-scoped, so it creates a fresh binding for `i` in every iteration of the loop, preserving the correct value for each timeout.

![bug using var](assets/BugA.png)

### ## Task 17 - Bug B: `this` binding

**Problem:** When a class method is passed directly to an event listener (`button.addEventListener('click', myTable.addRow)`), it loses its context. When the event fires, `this` evaluates to the DOM element (the button) instead of the class instance, causing the class properties to be `undefined`.
**Observation:** Expected `Adding row to: Attributes Table` but the console printed `Adding row to: undefined`.

![this bug before bind](assets/BugB.png)

**Fix:** There are two ways to fix this context loss in JavaScript:
1. Use `.bind(this)` in the constructor (`this.addRow = this.addRow.bind(this);`) to permanently bind the method to the class.
2. Use an Arrow Function for the method (`addRow = () => { ... }`), which inherently captures `this` from its surrounding lexical scope.

![this bug after bind](assets/BugB2.png)


### Bug C: Forgetting JSON.parse on localStorage

**Problem:** `localStorage` can only store text strings. When retrieving a stringified JSON object, if you forget to run `JSON.parse()`, the variable remains a string type instead of becoming a JavaScript object.
**Observation:** Attempting to access an object property (e.g., `badData.name`) on a string returns `undefined`. Attempting to chain a method on that property (`badData.name.toUpperCase()`) throws an `Uncaught TypeError: Cannot read properties of undefined`.


![bug c before](assets/BugC.png)

**Fix:** Wrap the `localStorage.getItem()` call in `JSON.parse()` to deserialize the string back into a usable JavaScript object.

![bug c after](assets/BugC2.png)

### Bug D: Mutating nested arrays/objects

**Problem:** Arrays and objects are passed by reference in JavaScript. If a function modifies a nested object within an array, it inadvertently mutates the caller's original data, causing unexpected side effects.
**Observation:** Modifying `cart[0].price` inside the function permanently changed `originalCart[0].price` to `0.5`.

![bugd](assets/bugd.png)

**Fix:** We must clone the data before modifying it. 
- Using the spread operator (`[...cart]`) creates a **shallow copy**, which fails here because the nested objects are still shared references.

![shallow copy](assets/shallowcopy.png)

- Using `structuredClone(cart)` creates a **deep copy**, completely severing all memory references and protecting the original data.

![deep copy](assets/deepcopy.png)

### Bug E: Event Listener Leak

**Problem:** When UI components (like modals) mount and unmount, any event listeners attached to global objects (like `window` or `document`) will persist forever unless explicitly removed. If a modal is opened and closed repeatedly, these listeners accumulate, causing severe performance degradation and duplicate event firing.
**Observation:** After opening and closing the leaky modal 3 times, pressing the Escape key once caused the event listener to fire 3 separate times simultaneously.

![leak before](assets/bugE.png)

**Fix:** Pass an `AbortSignal` to the event listener options (`{ signal: controller.signal }`). When the modal closes, calling `controller.abort()` will instantly and cleanly remove all event listeners associated with that signal, without needing to maintain references to the callback functions.

![leak after](assets/bugE2.png)

## Task 18 - Sources Panel Debugger

**Observation:**
By placing a breakpoint inside the `create()` function and submitting the form, execution paused exactly before the attribute was saved. 

**What I learned compared to console.log:**
1. The **Scope Panel** instantly displayed the entire state of the `attribute` object containing the form data, saving me from having to manually write `console.log` for every single variable I wanted to inspect.
2. The **Call Stack Panel** allowed me to trace the exact execution path backward in time, clearly showing that `create()` in `attributes.js` was triggered by an anonymous event listener function in `forms.js`.
3. By using the **Step Over** tool, I could advance the execution line-by-line while watching variables update in real-time, which is much more powerful for finding complex logic bugs than staring at static logs in the console.

![debug](assets/Task_18.png)
