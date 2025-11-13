---
title: Software
---

# Software

I develop and contribute to a range of software tools for astrophysical research, from large-scale simulation codes to specialized Python packages. Below are some of my key projects and contributions.

## Major Simulation Codes

### SWIFT

[SWIFT](https://gitlab.cosma.dur.ac.uk/swift/swiftsim) (SPH With Inter-dependent Fine-grained Tasking) is a state-of-the-art cosmological hydrodynamics simulation code designed to run efficiently on modern high-performance computing architectures. I lead the development of the zoom simulation framework.

**Repository:** [https://gitlab.cosma.dur.ac.uk/swift/swiftsim](https://gitlab.cosma.dur.ac.uk/swift/swiftsim)

## Specialized Tools

### MEGA

[MEGA](https://github.com/WillJRoper/mega) is a highly efficient halo finder and merger graph algorithm I developed for analyzing the outputs of cosmological simulations. It identifies dark matter halos and tracks their formation history through cosmic time with a focus on maintaining continuity across a halos complete evolution.

**Repository:** [https://github.com/WillJRoper/mega](https://github.com/WillJRoper/mega)

### GravyLensing

<p align="center">
  <img src="{{ '/pictures/gravylensing_demo.jpeg'  }}" alt="GravyLensing Real-time Demo" width="60%">
</p>

[GravyLensing](https://github.com/WillJRoper/GravyLensing) is a real-time gravitational lensing demonstration application written in C++ that I developed for the Goodwood Festival of Speed Future Lab. The application uses webcam input to detect people and applies FFT-based gravitational lensing effects to background images, creating an interactive experience where visitors can see themselves acting as a gravitational lens, distorting space and bending light around them just like massive objects in the Universe.

**Key Features:**
- Real-time person segmentation using TorchScript models
- FFT-based gravitational lens calculations with FFTW3
- Multi-threaded processing with OpenMP for smooth performance
- Qt6 graphical interface with support for multiple background images

**Repository:** [https://github.com/WillJRoper/GravyLensing](https://github.com/WillJRoper/GravyLensing)

## Python Packages

I maintain several Python packages on PyPI, ranging from astrophysics tools to general-purpose utilities:

### Synthesizer

[**synthesizer**](https://pypi.org/project/cosmos-synthesizer/) - A comprehensive C++ accelerated Python package for creating synthetic observations of the Universe. This tool enables forward modeling of galaxy properties, converting simulation data into observables that can be directly compared with telescope observations.

**Install:** `pip install cosmos-synthesizer`
**PyPI:** [https://pypi.org/project/cosmos-synthesizer/](https://pypi.org/project/cosmos-synthesizer/)

### h5forest

[**h5forest**](https://pypi.org/project/h5forest/) - A lightweight command-line tool for viewing HDF5 file structures in the terminal. Essential for quickly navigating the complex hierarchical structure of simulation output files.

**Install:** `pip install h5forest`
**PyPI:** [https://pypi.org/project/h5forest/](https://pypi.org/project/h5forest/)

### dir-wand

[**dir-wand**](https://pypi.org/project/dir-wand/) - A CLI tool for creating multiple directories from a template automagically. Streamlines project setup and organization.

**Install:** `pip install dir-wand`
**PyPI:** [https://pypi.org/project/dir-wand/](https://pypi.org/project/dir-wand/)

### unknown-pixels

[**unknown-pixels**](https://pypi.org/project/unknown-pixels/) - A creative tool that converts images into Unknown Pleasures-style waveform art, inspired by the iconic Joy Division album cover.

**Install:** `pip install unknown-pixels`
**PyPI:** [https://pypi.org/project/unknown-pixels/](https://pypi.org/project/unknown-pixels/)

## Other Projects

You can find more of my open-source projects and contributions on my [GitHub profile](https://github.com/WillJRoper).

---

_All software is open source and available for use in your own research. If you use any of these tools in your work, please cite the relevant papers and acknowledge the software appropriately._
