# Reflection

- What (if anything) still is not complete?
I am pretty happy with how this piece came out, especially considering how it started! At first I only had giant and extremely slow metaballs moving across my screen. However, after working and tinkring with my code, I think I managed to produce a very satisfiying piece that I can say is complete.

- If it is not complete, what is left and how are you going to address it?

While I think my piece is complete, I always say there is opportunity and room for further development/growth. I think it would be interesting to experiement with how to make the blobs completely different colors than the background (despite transparency and its layering/blending capabilities somewhat allowing the blobs to have their own shading/appearance). If I get the time, I would address this by first, try remaking my metaballs using shaders (since I think altering their color would be too much for my computer to handle). Then I would try to explore with color!

- What (if anything) did you struggle with?
The main thing I struggled with was implementing the linear interpolation part of Jamie Wong's tutorial. While I got the metaballs working with a simpler and more generalized version of linear interpolation (where the interpolation factor, t, was simply 0.5), it never ensured that contour lines were properly placed in the marching square algorithm. I wanted to follow Jamie's tutorial as best I could (to make accurate looking metaballs), but struggled with using a more precise interpolation factor of t. More specifically, my f1 and f2 influence values sometimes got too close to being equal (resulting in line artifacts). There were many times where I had to handle cases to ensure there were no errors or problems with the contour lines being drawn. The different cases for the marching squares was also a little difficult to comprehend, but once I got one case, the rest became easier -- I would say it was a tedious approach and using shaders would have helped me out. 

- What, if anything, have you gained by completing this project?
After completeting this project, I think I gained a much deeper understanding of the marching squares algorithm and how it can be applied to create metaball shapes. It also helped me better understand linear interpolation and how it is also part of creating accurately drawn/precise metaballs. I also think that it helped me a lot with problem solving -- while I had to find ways to resolve line artifacts, I also had to think of creative ways to make a lava lamp effect without using shaders/using techniques that wouldn't slow down my piece. So while I think I learned a lot technically, I also think it helped me creatively in terms of thinking outside of the box.



