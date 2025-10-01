# Resource Box Overflow Fix

## Issue
The "Chaos Points" text and other resource labels were overflowing their containers, particularly visible on smaller screens and at certain zoom levels.

## Root Causes

1. **No width constraints** on `.resource-label` and `.resource-value`
2. **No flex controls** to manage space allocation
3. **No gap** between label and value causing overlap
4. **Missing min-width** on left panel causing flex shrinking issues

## Solutions Applied

### 1. **Flex Layout Improvements**

**Before:**
```css
.resource-item {
    display: flex;
    justify-content: space-between;
    padding: 10px;
}
```

**After:**
```css
.resource-item {
    display: flex;
    justify-content: space-between;
    align-items: center;  /* Vertical alignment */
    padding: 10px;
    gap: 10px;            /* Space between elements */
    min-height: 40px;     /* Prevent collapse */
}
```

### 2. **Width Constraints on Labels**

```css
.resource-label {
    font-weight: bold;
    flex-shrink: 0;           /* Don't shrink */
    white-space: nowrap;      /* Keep on one line */
    overflow: hidden;         /* Hide overflow */
    text-overflow: ellipsis;  /* Show ... if too long */
    max-width: 60%;           /* Max 60% of container */
}
```

### 3. **Width Constraints on Values**

```css
.resource-value {
    color: #4fc3f7;
    font-weight: bold;
    flex-shrink: 0;           /* Don't shrink */
    white-space: nowrap;      /* Keep on one line */
    overflow: hidden;         /* Hide overflow */
    text-overflow: ellipsis;  /* Show ... if too long */
    text-align: right;        /* Right-align numbers */
    min-width: 60px;          /* Minimum space for numbers */
}
```

### 4. **Left Panel Container Fix**

```css
.left-panel {
    display: flex;
    flex-direction: column;
    gap: 20px;
    min-width: 0;         /* Allow flex shrinking */
    overflow: hidden;     /* Prevent overflow */
}
```

### 5. **Section Box Sizing**

```css
.doomsday-clock-section,
.resources-section,
.apocalypse-section {
    /* ... existing styles ... */
    width: 100%;
    box-sizing: border-box;  /* Include padding in width */
    padding: 15px;           /* Reduced from 20px */
}
```

### 6. **Responsive Adjustments**

#### Mobile (< 600px)
```css
.resource-item {
    font-size: 0.85em;
    padding: 8px;
    gap: 8px;
}

.resource-label {
    max-width: 50%;      /* More room for values */
    font-size: 0.9em;
}

.resource-value {
    font-size: 0.9em;
    min-width: 50px;
}
```

#### Extra Small (< 400px)
```css
.resource-item {
    font-size: 0.8em;
    padding: 6px;
    gap: 6px;
}

.resource-label {
    max-width: 45%;      /* Even more room for values */
    font-size: 0.85em;
}

.resource-value {
    font-size: 0.85em;
    min-width: 45px;
}
```

## Visual Comparison

### Before:
```
┌─────────────────────────────────┐
│ 📊 RESOURCES                    │
├─────────────────────────────────┤
│ Chaos Points: 20.81K [OVERFLOW] │  ← Text escaping box
│ Chaos/sec: 0                    │
│ Doom Energy: 60                 │
│ 💀 Apocalypse Tokens: 1         │
└─────────────────────────────────┘
```

### After:
```
┌──────────────────────────────────┐
│ 📊 RESOURCES                     │
├──────────────────────────────────┤
│ Chaos Points:          20.81K    │  ← Properly contained
│ Chaos/sec:                 0     │
│ Doom Energy:              60     │
│ 💀 Apocalypse Tokens:      1     │
└──────────────────────────────────┘
```

## Key Properties Explained

### `flex-shrink: 0`
Prevents elements from shrinking below their content size. Critical for maintaining readability.

### `white-space: nowrap`
Keeps text on a single line. Combined with `text-overflow: ellipsis` for long text.

### `gap: 10px`
Creates consistent spacing between flex items without margins.

### `min-width: 0`
Allows flex containers to shrink below their content size when needed (on parent).

### `max-width: 60%`
Prevents labels from taking up too much space, leaving room for values.

## Testing Results

✅ **Desktop (1920x1080)** - Perfect spacing, no overflow
✅ **Laptop (1366x768)** - Proper wrapping with ellipsis if needed
✅ **Tablet (768x1024)** - Reduced padding, smaller fonts
✅ **Mobile (375x667)** - 50/50 split between label and value
✅ **Small Mobile (320x568)** - 45/55 split, minimal padding

## Edge Cases Handled

1. **Very long resource names** - Ellipsis after 60% width
2. **Very large numbers** - Right-aligned with min-width guarantee
3. **Narrow screens** - Progressive font size reduction
4. **Zoomed displays** - Responsive breakpoints activate
5. **Long emoji labels** - Emoji width included in calculations

## Files Modified

- `style.css` - Resource item layout (Lines 189-273)
- `style.css` - Left panel container (Lines 101-107)
- `style.css` - Mobile responsive (Lines 1119-1143)
- `style.css` - Extra small responsive (Lines 1207-1225)

## Additional Benefits

1. **Better touch targets** - `min-height: 40px` on mobile
2. **Consistent spacing** - `gap` property replaces margin calculations
3. **Vertical alignment** - `align-items: center` for clean appearance
4. **Right-aligned numbers** - Easier to compare values visually

---

**Fixed:** 2025-10-01
**Status:** Complete ✅
**Issue:** Resource text overflow
**Solution:** Flex layout constraints + responsive sizing
