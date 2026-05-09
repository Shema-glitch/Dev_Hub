# Design Engineering Skill (Inspired by Emil Kowalski)

## Philosophy
"Taste is trained, not innate." Details compound to create a feeling of quality.

## Animation Principles
- **Decision Framework**:
  - Should it exist? (Does it add value or just distraction?)
  - What is its purpose? (Feedback, context, state change?)
  - Physical properties: Snappy, natural easing (no linear), 0.15s-0.3s duration.
- **Implementation**:
  - Animate only `transform` and `opacity`.
  - Use CSS transitions for simple states; Framer Motion for complex ones.
  - Interactive elements (buttons) must have clear active/pressed states.

## Component Guidelines
- **Popovers/Modals**: Must expand from the origin (the trigger).
- **Tooltips**: Snappy feel—skip delays on subsequent hovers if one is already open.
- **Buttons**: Subtle scale-down (0.98) on click for tactile feedback.
- **Scrolling**: Use smooth scrolling and fade-out masks for long content.
