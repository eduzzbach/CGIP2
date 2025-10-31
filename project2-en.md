# Project 2 — 3D Hierarchical Modelling & Projections
**Version Draft 0.94 — Student-Friendly Edition**

## Change Log
- 30/10/2025 23h00, Draft 0.94 published (typos)
- 28/10/2025 23h00, Draft 0.93 published (techincal details)
- 28/10/2025 01h03, Draft 0.92 published (student-friendly + checklist)
- 28/10/2025 01h00, version 0.91 published.
- 27/10/2025 18h30, Draft 0.9 version published.
---

## Objective

You will create a WebGL application where you control a tomato-launching tank 🚜🍅  
The tank uses **hierarchical modelling** and must display **multiple projection types**.

The tank should resemble the one in the figures:

|  |  |
|-----------|-----------|
| ![Front View](assets/front_view.png) | ![Left Side](assets/left_view.png)|
| *Front View* | *Left View* |
| ![Top View](assets/top_view.png) | ![Oblique View](assets/oblique_view.png)|
| *Top View* | *Oblique View* |

---

## Controls

Most actions use the keyboard.

<img src="assets/kbd_controls.png" width="30%" />

| Feature | Keys |
|--------|-----|
| Move tank parts | `q`, `w`, `e`, `a`, `s`, `d` |
| Shoot a tomatoe | `z` |
| Select camera for single view | `1`, `2`, `3`, `4` |
| Toggle single ⇆ multiple views | `0` |
| Toggle axonometric ⇆ oblique (view 4) | `8` |
| Toggle parallel ⇆ perspective | `9` |
| Adjust axonometric/oblique parameters | Arrow keys |
| Wireframe ⇆ Solid | Space |
| Reset projection + zoom | `r` |

**Requirements**
- No distortion when resizing the window
- Mouse wheel zoom in all views
- Tank must remain fully visible and centred

Add a ground plane at *y = 0* using a chequered pattern of cube primitives.

---

## Tank Modelling Requirements

Your tank design is free, but must include at least:

| Part | Behaviour |
|------|-----------|
| Cabin | Rotates left/right (`a`, `d`) |
| Cannon | Rotates up/down (`w`, `s`) |
| Base | Holds 12 wheels |
| Wheels | Rotate when tank moves (`q`, `e`) |
| Primitive count | ≥ 18 primitives |

Apply **realistic movement limits** (e.g., cannon should not rotate 360°).

---

## Hierarchy / Scene Graph

Build a **scene graph** to organise tank parts:

You may:

1️⃣ Hard-code the graph while drawing the scene **!!!!!!!!!!!!!!!(DÁ ZERO VALORES)!!!!!!!!!!!!!!!**
**or**  
2️⃣ Represent the graph using a **JavaScript object** or **JSON**, then traverse it to render

### Node Types
- **Internal node:** transformations + child nodes
- **Leaf node:** transformations + a geometric primitive

### Each node must store:
- Scale  
- Rotation around X, Y, Z  
- Translation  

Transform order (applied to a point **P**, multiplied on the right):

> **T · Rz · Ry · Rx · S**

The **root** must be an internal node.

Nodes should be **named** so their transforms can be modified by keyboard events.

The ground plane may be rendered directly or inserted into the graph dynamically.

---

## Evaluation — 20 points

| Feature | Points |
|---------|-------|
| Tank modelling (all parts + correct motion) | 9 |
| Views & projection controls | 6 |
| Scene graph (.js or .json) | 2 |
| Tomato ammunition | 1 |
| Creative extras (game mode, more tanks, etc.) | 2 |

Make it fun if you want! 🍅

---

## ✅ Visual Checklist (for students)

### Tank Modelling
- [ ] Cabin rotates (`a`, `d`)
- [ ] Cannon rotates (`w`, `s`)
- [ ] Minimum 12 wheels
- [ ] Wheels rotate when tank moves (`q`, `e`)
- [ ] Minimum 18 primitives used
- [ ] Realistic movement limits applied

### Views & Projections
- [ ] Single/multiple views toggle (`0`)
- [ ] Four camera presets (`1–4`)
- [ ] View 4: axonometric/oblique toggle (`8`)
- [ ] Parallel/perspective toggle (`9`)
- [ ] Parameters adjusted via arrow keys
- [ ] Zoom with mouse wheel (centred view)
- [ ] No distortion on window resize

### Scene Graph
- [ ] Internal + leaf nodes implemented
- [ ] Correct transform order
- [ ] Named nodes for control
- [ ] Graph defined in JS or JSON

### Ground + Extras
- [ ] Chequered ground plane at y = 0
- [ ] Tomatoes can be fired
- [ ] Creative add-ons (optional)

---

## Technical Notes

**Important**: You cannot use external javascript libraries that are not in the shared repository!

### Multiple views

To display multiple views you need to have a viewport for each view. Simply divide the canvas area into 4 equal sized viewports and draw the scene 4 times, once for each viewport. The logic should be something like:

```javascript
   if ( ... ) {
        // Draw on front view
        gl.viewport(...);
        draw_scene(g..., front_view);

        // Draw on top view
        gl.viewport(...);
        draw_scene(..., top_view);

        // Draw on left view
        gl.viewport...);
        draw_scene(..., left_view);

        // Draw of 4th view
        gl.viewport(...);
        draw_scene(..., fourth_view);
    }
    else {
        gl.viewport(0, 0, canvas.width, canvas.height);
        draw_scene(..., big_view);
    }
```

### Scene graph / Javascipt / JSON

Javascript objects can be represented in textual format by using the JavaScript Object Notation (JSON).

Consider the following javascript object:
```javascript
let someobject = {
    a: 10,
    b: "some string",
    c: [10, 20, 30],
    d: { 
        f: 100, 
        g: ["aaa", "bbb]}
}
```

Its external representation in JSON format would be:
```JSON
{
    "a": 10,
    "b": "some string",
    "c": [10, 20, 30],
    "d": {
        "f": 100,
        "g": ["aaa", "bbb"]
    }
}
```

The `utils.js` library offers a function (`loadJSON()`)to asynchronously load JSON files and return the corresponding javascript object(s).

You can declare your scene as a hierarchy of javascript objects or by its JSON equivalent. Beware that representing subgraphs in JSON will require some additional effort from your side.

**Hint:** Represent you scene graph in JSON as an array of independent subgraphs and allow node to "point" to other subgraphs.

### Drawing the ground

If you hard-code your scene graph, write a function that accepts the number of tiles along each direction and the tile dimensions and have that function called from within your render loop.

If you use a javascript object write a function that can insert a node as a child of some other node.

**Hint:** Functions to return a node with a given name or to insert a node as a child of another may be useful.

you can write a function to insert another node as a child of some node.

### Shooting 🍅s (and being hit by a 🍅)

#### Enter the Tomatina mood!!!

In order to shoot a 🍅 you will need to discover where the tip of the canon is (in World Coordinates) and which direction it is pointing at. Let's call these **p** and **d**. You can then integrate the 🍅 movement by first transforming the direction **d** into an actual velocity **v**. Integration can now be performed on a step by step basis:

$$
    p_i = p_{i-1} + v_i dt
$$
$$
    v_i = v_{i-1} + g dt
$$

This corresponds to the well know Euler numerical integration method for a time step of $dt$. Gravity is represented by $g$.

To determine the tip of the canon in World coordinates you can start by its well known location in local coordinates (after all you modelled the canon yourself, right?). Then use the composite transformation stored in your scenegraph that affects the primitive you used for the canon. The same applies to the direction the canon is pointing at (use homogeneous coordinates please!).

#### Prepare to look like a 🍅

If you want to have fun setting some targets to be hit by 🍅s, you need a way to check for hits. Typically, in a game this is usually achived by transforming the projectile coordinates to the local object coordinate system. Suppose you have a figure with 🙈, torso and legs. For simplicity suppose the 🙈 was modelled using a unit radius sphered centered at the origin. To check if a 🍅 hits you in the 🙈, you can simply convert the 🍅 center point from world coordinates to the local coordinates of the 🙈 (the opposite of what you do to draw it) amd check if the point is inside a unit sphere centered at the origin.




---

*🚀 Good luck — the world is counting on your tomato tank innovation.*