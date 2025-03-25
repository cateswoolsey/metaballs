[![Review Assignment Due Date](https://classroom.github.com/assets/deadline-readme-button-22041afd0340ce965d47ae6ef1cefeee28c7c493a6346c4f15d667ab976d596c.svg)](https://classroom.github.com/a/EjdKcPEz)
# Project 03 - Advanced Techniques

For my project3, I explored the technique of metaballs (using marching squares and linear interpolation to create smooth blob-like shapes that blend and merge when they come into proximity). I use this metaball technique to explore the look of a classic lava lamp -- more specifically, my metaballs mirror the way molten moves in a lava lamp (continuously shifting, separating, and reconnecting as a jelly-like substance). I enhance the smooth movement of the blobs and provide them an almost 3D like effect by using a perlin noise background (which is a technique and tool we learned about in previous classes). In this case, small sections of the canvas shift with varying shades of bluish/white color, all of which is made very transparent to allow layer of noise to blend/build up and create a sense of depth. The blur effect, which we also learned about in class,is used to unify the canvas, smoothing together the moving metaballs and the noise background. 

The majority of my process/understanding (of marching squares algorithm and linear interpolation) can be creddited to Jamie Wong's tutorial: https://jamie-wong.com/2014/08/19/metaballs-and-marching-squares/

I also looked at the Kahn academy (metaball example) link he provided: https://www.khanacademy.org/computer-programming/Metaballs!/6209526669246464

This interactive website, very similar to Jamie Wong's, helped with the understanding of marching squares/linear interpolation: https://jurasic.dev/marching_squares/