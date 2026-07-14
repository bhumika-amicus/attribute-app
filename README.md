# Attribute App

# Task 1 – Project Structure & HTML Metadata

## Folder Structure

The project is organized into separate folders to keep related files together and make future development easier.

```
attribute-app/
│
├── index.html
├── add-attribute.html
├── edit-attribute.html
│
├── css/
├── js/
├── assets/
├── data/
│
├── README.md
└── BUGS.md
```

## HTML Notes

### Why does the order of `<meta charset>` matter?

The `<meta charset>` tag should be placed near the beginning of the `<head>` section because browsers need to know the character encoding before reading the HTML. It should appear within the first 1024 bytes of the document so the browser can correctly decode the page.

### What does `<meta name="theme-color">` control on mobile?

The `theme-color` meta tag controls the browser UI color on supported mobile devices, such as the address bar and surrounding browser chrome.

---

# Task 2 – HTML5 Landmarks

## Implementation

The pages were structured using HTML5 semantic landmarks:

- `header` with `role="banner"`
- `nav` with `role="navigation"` and `aria-label="Primary"`
- Skip link as the first interactive element
- `main` with `id="main-content"`
- Named `section` elements using `aria-labelledby`
- `aside` for Quick Stats
- `footer` with `role="contentinfo"`

## Reasoning

Semantic landmarks help screen readers understand the page structure and allow users to navigate quickly between important regions.

### When does a `<section>` become a landmark?

A `<section>` becomes a landmark only when it has an accessible name, usually through `aria-labelledby` or `aria-label`.

### Why use a skip link?

The skip link lets keyboard and screen reader users jump directly to the main content without tabbing through the navigation on every page.

# Task 3 – Filter Region

## Implementation

The filter area was built using:

- `<form role="search" method="get">`
- Search input (`type="search"`)
- Business Unit dropdown
- Status dropdown
- Submit button
- Proper `<label for="">` for every control
- `inputmode="search"`
- `autocomplete="off"`
- Live region using `aria-live="polite"` for future result updates

## Reasoning

Using `role="search"` identifies the form as a search region for assistive technologies. Proper labels improve accessibility, while the live region will allow JavaScript to announce filter results without interrupting the user.

# Task 4 – Results Table

## Implementation

The results were displayed using a semantic HTML table containing:

- Table caption
- Column headers with `scope="col"`
- `aria-sort="none"` on sortable columns
- Eight sample rows
- Row headers using `scope="row"`
- Status displayed as text ("Active" / "Inactive")
- Edit action as a link
- Delete action as a POST form with a submit button

## Reasoning

Using semantic table elements makes tabular data easier for screen readers to understand. Text-based status ensures accessibility, and using a POST form for Delete follows proper web semantics.

### Why is Delete a POST form instead of a link?

Deleting data changes application state, so it should use POST rather than GET. GET requests are intended only for retrieving data and can be triggered accidentally by bookmarks, crawlers, or browser prefetching.

# Task 5 – Add/Edit Attribute Form

## Implementation

The Add and Edit pages use a semantic HTML form with:

- `<form method="post" action="#" novalidate aria-labelledby="form-title">`
- `<fieldset>` and `<legend>` to group related fields
- Required fields:
  - Attribute Name
  - Business Unit
  - Customer Location
  - Company
  - Status (radio group)
  - Created On
  - Notes
- Appropriate input types (`text`, `select`, `radio`, `date`, `textarea`)
- Validation attributes (`required`, `minlength`, `maxlength`, `pattern`)
- Proper `<label for="">` for every field
- Hint text connected using `aria-describedby`
- Empty error placeholders with `role="alert"` and `aria-live="polite"`
- Error summary region at the top of `<main>` for future JavaScript validation

## Reasoning

The form is structured to be accessible and ready for future CSS and JavaScript. All fields have unique IDs, labels, hints, and error placeholders so custom validation can be added without changing the HTML.

### Why use `novalidate`?

`novalidate` disables the browser's default validation popups while keeping all HTML validation rules. This allows JavaScript in A3 to display consistent custom error messages using the existing validation attributes.




## Task 6 – Validation Testing

### Test 1: Form Submission with `novalidate`

**Browsers tested:**
- Google Chrome
- Microsoft Edge

**Observation:**

When the form had `novalidate`, the browser allowed submission with required fields empty.

**Result:**
- No native browser validation messages were displayed.
- HTML validation was disabled by the browser.

### Test 2: Form Submission without `novalidate`

After removing `novalidate`, the form was submitted again with empty required fields.

**Result:**
- Microsoft Edge displayed native validation messages.
![Validation screenshot (Chrome)](assets/image-2.png)

- Google Chrome showed similar validation prompts.

  ![Validation screenshot (Chrome)](assets/image-1.png)

After testing, the `novalidate` attribute was restored.

---

## Three Layers of Validation

### 1. HTML Validation

Built-in browser validation using attributes such as:
- `required`
- `minlength`
- `maxlength`
- `pattern`
- `type`

This provides quick client-side feedback.

### 2. JavaScript Validation

JavaScript enhances validation by:
- displaying custom error messages
- highlighting invalid fields
- showing an error summary
- enforcing additional rules

### 3. Server-side Validation

Server-side validation is mandatory because the client can be bypassed.

Users can bypass browser validation by:
- using developer tools
- removing HTML validation attributes
- disabling JavaScript
- sending requests with `curl` or Postman

Only server-side validation can be trusted in production.

---

## Layout Decisions

### Attribute List (`index.html`)

- **Layout:** Header → filter section → results table → quick stats → footer
- **Rejected:** sidebar filters and extra table columns like Created On / Notes
- **Above the fold:** navigation, filters, and the start of the results table
- **Mobile-first:** stack filters vertically, move Quick Stats below the table, and use a responsive table layout

### Add Attribute (`add-attribute.html`)

- **Layout:** single-column form with grouped fields and bottom action buttons
- **Rejected:** two-column form and top action buttons
- **Above the fold:** page title, error summary, and first required fields
- **Mobile-first:** full-width inputs and buttons with comfortable spacing

### Edit Attribute (`edit-attribute.html`)

- **Layout:** consistent structure with Add page, plus metadata before the form
- **Rejected:** metadata at the bottom and a side panel
- **Above the fold:** page title, record details, and the start of the form
- **Mobile-first:** keep the single-column layout and stack metadata above the form

---

## Keyboard Navigation

### `index.html`

1. Skip to main content
2. Attribute List
3. Add Attribute
4. Search
5. Business Unit
6. Status
7. Apply Filters
8. Edit (row 1)
9. Delete (row 1)
10. Edit (row 2)
11. Delete (row 2)
...
12. Delete (last row)

### `add-attribute.html`

1. Skip to main content
2. Attribute List
3. Add Attribute
4. Attribute Name
5. Business Unit
6. Customer Location
7. Company
8. Status (Active selected; use arrow keys to switch)
9. Created On
10. Notes
11. Save Attribute
12. Reset

### `edit-attribute.html`

1. Skip to main content
2. Attribute List
3. Add Attribute
4. Attribute Name
5. Business Unit
6. Customer Location
7. Company
8. Status (Active selected; use arrow keys to switch)
9. Created On
10. Notes
11. Update Attribute
12. Reset

### Lighthouse Observation

Lighthouse reported the warning **"Touch targets do not have sufficient size or spacing"**, which resulted in an Accessibility score of **96/100**.

**Cause:** The navigation links were displayed close together, so their clickable (touch) areas did not meet the recommended minimum size and spacing for touch devices. Lighthouse evaluates the rendered page, not just the HTML, so even though the navigation used the correct semantic structure (`<nav><ul><li><a>`), the default browser styling left the links too close together.

**Observation:** I tested replacing the semantic list (`<ul><li>`) with direct `<a>` elements inside the `<nav>`, and Lighthouse then reported an Accessibility score of **100/100**. However, this changed the page layout rather than addressing the actual issue.

**Decision:** I kept the semantic list structure because navigation menus should be marked up as a list of links. The warning is related to presentation rather than HTML semantics and will be resolved in the CSS phase by increasing the padding and spacing between the navigation links.


![lighthouse-obs](assets/image-5.png)



