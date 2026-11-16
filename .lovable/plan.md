# Carousel photo and scrolling fixes

## 1. Show the complete photo
- Fix the image sizing: the test post currently renders a portrait photo 859px tall inside a 512px frame, hiding its bottom.
- Give every slide a stable, responsive frame with explicitly bounded images and `object-fit: contain`. Portrait and landscape photos retain their full proportions, with space around them where necessary.
- Keep the existing dashed borders, arrows and image counter.

## 2. Add gentle parallax
- Use the existing Embla carousel engine for horizontal dragging and snapping.
- Move the photo slightly relative to its slide during horizontal movement, similar to the linked example, without enlarging it. Photos remain fully visible when a slide settles.
- Disable the extra movement for readers who prefer reduced motion; no autoplay or additional image downloads.

## 3. Make mobile page scrolling comfortable
- Allow vertical touch gestures to scroll the article naturally, while horizontal gestures switch photos.
- Keep arrows available for readers who prefer tapping; disable arrows at the ends and update the counter after selection.
- Clean up carousel listeners when leaving a post.

## 4. Verify your real test post
- Check every image in `/blog/test-carousel-post` on desktop and a phone-sized screen, including the original portrait photo.
- Test arrow navigation, horizontal touch swipes, vertical scrolling directly over a photo, and reduced-motion behavior.
- Run the existing image-grouping tests so images separated by text remain separate.

## Technical details
- Keep Wisp loading, caching, article content and grouping rules unchanged.
- Replace delegated native gallery scrolling with a small client-side Embla enhancement for the existing article markup.
- Restrict styling changes to gallery sizing, motion and controls.