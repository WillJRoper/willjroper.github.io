---
title: About Me
---

# About Me

I am a Computational Astrophysicist and Software Developer with a focus on High Performance Computing, Forward Modelling, and Cosmological Simulations. I am currently a Research Fellow in Extragalactic Astronomy at the University of Sussex, where I study how galaxies form and evolve in the early Universe. My research sits at the intersection of cosmological simulations, software development, and observational astronomy, with a particular focus on the first billion years of cosmic history—a period when the Universe's first galaxies were born and shaped the cosmos we see today.

## Research Interests

### Galaxy Formation and Evolution

My primary research focuses on understanding the physical processes that govern galaxy formation and evolution during the Epoch of Reionisation (z > 5). During this critical period, the first stars and galaxies formed, transforming the Universe from a dark, neutral state into the transparent, ionised environment we observe today. Since these galaxies evolve on distinctly inhuman spatial and temporal scales, I create computational laboratories to study their formation and evolution-Cosmological hydrodynamical simulations.

Key questions I'm working to answer include:

- What are the main drivers of morphological and structural evolution in high-redshift galaxies?
- What role does environment play in shaping high-redshift galaxy properties?
- How do observational uncertainties affect our understanding of early galaxy populations?

#### FLARES: First Light And Reionisation Epoch Simulations

A corner stone of my early work has centered on [FLARES](https://flaresimulations.github.io/), a suite of cosmological hydrodynamical zoom simulations I co-developed and analysed to probe galaxy formation and evolution at z ≥ 5. FLARES uses a novel approach: rather than simulating a single large volume, we run 40 high-resolution zoom simulations of overdense and underdense regions selected from a large parent volume. This technique allows us to capture the full range of cosmic environments while maintaining the resolution needed to model individual galaxies accurately.

#### SWIFT Development and Zoom Simulations

I am a developer of the [SWIFT](https://gitlab.cosma.dur.ac.uk/swift/swiftsim) simulation code, which is designed to make the most of modenr high-performance computing architectures to run the most efficient and detailed simulations of the Universe. My work in SWIFT focuses on improving the code's zoom simulation capabilities, enabling inexpensive exploration of traditionally intractable simulation regimes. Beyond this zoom simulation work, I also contribute to the broader SWIFT codebase, helping to further optimise its performance and contribute towards the shaping of future national HPC strategy for astrophysical simulations in the UK.

### Software Development

Beyond SWIFT, I'm passionate about developing efficient, user-friendly tools for the astrophysics community. My contributions include:

- I am lead developer of [Synthesizer](https://github.com/synthesizer-project/synthesizer), a C++ accelerated Python package for forward modelling theory into synthetic observations. `Synthesizer` is a fast and flexible tool designed to efficiently vary modelling assumptions while modelling both parametric models and the results of large cosmological simulations.

- I'm the lead developer of [MEGA](https://github.com/WillJRoper/mega), a fast and memory-efficient halo finder and merger graph algorithm designed specifically for zoom simulations. MEGA enables researchers to track the formation history of dark matter halos and their host galaxies across cosmic time, providing crucial insights into how structure forms in the Universe.

- More generally, I maintain several Python packages addressing a range of use cases from CLI utilities to novelty packages. For more details see my [software page](/software.html).

### Forward Modelling and Observational Comparisons

A crucial aspect of my work involves "forward modelling"—taking simulation outputs and generating mock observations that can be directly compared with telescope data. With `Synthesizer`, I translate theoretical predictions into falsifiable uncertainty aware synthetic observations, including:

- Stellar population synthesis with nebular emission
- Dust attenuation and re-emission
- AGN contribution to galaxy SEDs
- Observational selection effects and photometric uncertainties

This work bridges the gap between theory and observation, allowing us to test our galaxy formation models against real observations from a range of facilities, including the Hubble Space Telescope and the James Webb Space Telescope.

## Public Engagement

In addition to research, I am an avid advocate for public engagement and science communication. I regularly participate in outreach activities, including public talks, school visits, and science festivals, to share the excitement of astrophysics with diverse audiences. Beyond these activities, I collaborate with a range of companies from CGI studios to XR production companies to produce new and innovative ways to communicate complex scientific concepts to the public. You can learn more about these projects on my [public engagement page](/public-engagement.html).
