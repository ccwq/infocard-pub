# Table scroll container vs card scroll

Use this when a mobile card contains a wide comparison table, parameter table, or matrix and the page should remain readable on 390px.

## Goal
- The table should scroll horizontally on its own.
- The surrounding card, title, and section header should stay fixed.
- The page should not shrink the entire layout just to hide the overflow.

## Correct pattern

### HTML
```html
<section class="section">
  <h2>与其他开源模型比较</h2>
  <div class="table-wrap">
    <table>
      ...
    </table>
  </div>
</section>
```

### CSS
```css
.table-wrap{
  overflow:auto;
  max-width:100%;
  -webkit-overflow-scrolling:touch;
}
table{
  min-width:900px;
  width:100%;
}
@media(max-width:760px){
  .table-wrap{display:block}
  .table-wrap table{min-width:900px}
}
```

## When to switch to a mobile card stack
Use a card stack when:
- the table has more than ~5 columns,
- the table values are long phrases,
- the mobile page becomes too wide even after wrapping,
- or the table is not important enough to justify horizontal scrolling on a phone.

## Verification
- On desktop, the table is fully visible.
- On 390px mobile, the table wrapper scrolls horizontally while the rest of the page stays fixed.
- `document.querySelector('.table-wrap').scrollWidth > document.querySelector('.table-wrap').clientWidth`
- `document.documentElement.scrollWidth <= window.innerWidth` if the page has no other overflow.

## Common mistake
Putting `overflow-x:auto` on the whole card or section makes the title and header scroll with the table. That is the wrong behavior when the user expects only the table to move.
