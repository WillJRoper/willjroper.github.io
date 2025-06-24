"""
compute_hotspots.py

Usage:
    python compute_hotspots.py definitions.yaml regions.yaml

Reads definitions.yaml with structure:

main:
  name: "main"
  dzi: "main/euclid.dzi"
  ra: "06:10:05.23"
  dec: "-33:31:12.91"
  area: 132      # in square degrees
others:
  - name: "imageA"
    dzi: "imageA/imageA.dzi"
    ra: "06:12:00.00"
    dec: "-33:30:00.00"
    area: 20

Generates regions.yaml where each entry lists overlapping images:
  x_px, y_px, radius_px: Python floats relative to main image
  ra, dec: celestial coords
"""

import math
import sys
import xml.etree.ElementTree as ET

import astropy.units as u
import yaml
from astropy.coordinates import SkyCoord


def parse_dzi_size(dzi_path):
    """Parse a .dzi file and return (width_px, height_px)."""
    tree = ET.parse(dzi_path)
    root = tree.getroot()
    ns = {"dz": "http://schemas.microsoft.com/deepzoom/2008"}
    size = root.find("dz:Size", ns)
    return int(size.get("Width")), int(size.get("Height"))


def compute_angular_extents(area_sqdeg, pixel_w, pixel_h):
    """
    Given a rectangle of pixel size (pixel_w x pixel_h) that must cover
    area_sqdeg square degrees, compute the angular width & height in degrees.
    """
    # area = W_deg * H_deg, with W_deg/H_deg = pixel_w/pixel_h
    k = math.sqrt(area_sqdeg / (pixel_w * pixel_h))
    return k * pixel_w, k * pixel_h


if __name__ == "__main__":
    if len(sys.argv) != 3:
        print("Usage: python compute_hotspots.py definitions.yaml regions.yaml")
        sys.exit(1)
    defs_file, out_file = sys.argv[1], sys.argv[2]

    # Load input definitions
    defs = yaml.safe_load(open(defs_file))
    main_def = defs["main"]
    other_defs = defs.get("others", [])

    # Main image pixel & angular sizes
    main_w_px, main_h_px = parse_dzi_size(main_def["dzi"])
    main_area = float(main_def["area"])
    main_W_deg, main_H_deg = compute_angular_extents(main_area, main_w_px, main_h_px)
    deg_per_px_x = main_W_deg / main_w_px
    deg_per_px_y = main_H_deg / main_h_px

    # Main image center in sky coords
    main_coord = SkyCoord(main_def["ra"], main_def["dec"], unit=(u.hourangle, u.deg))

    regions = {main_def["name"]: []}

    for other in other_defs:
        # Other image center & size
        ocoord = SkyCoord(other["ra"], other["dec"], unit=(u.hourangle, u.deg))
        ow_px, oh_px = parse_dzi_size(other["dzi"])
        oarea = float(other["area"])
        oW_deg, oH_deg = compute_angular_extents(oarea, ow_px, oh_px)

        # Compute separations (in degrees; RA scaled by cos(dec))
        dra = (ocoord.ra.degree - main_coord.ra.degree) * math.cos(
            math.radians(main_coord.dec.degree)
        )
        ddec = ocoord.dec.degree - main_coord.dec.degree

        # Rectangular overlap test
        if abs(dra) <= (main_W_deg / 2 + oW_deg / 2) and abs(ddec) <= (
            main_H_deg / 2 + oH_deg / 2
        ):
            # Compute pixel center: x from left, y from top
            x_px = (dra + main_W_deg / 2) / deg_per_px_x
            # Flip the sign so positive DEC shift moves up (towards smaller y)
            y_px = (ddec + main_H_deg / 2) / deg_per_px_y

            # Pixel radius: average of half-width & half-height
            r_px_x = (oW_deg / 2) / deg_per_px_x
            r_px_y = (oH_deg / 2) / deg_per_px_y
            radius_px = (r_px_x + r_px_y) / 2.0

            regions[main_def["name"]].append(
                {
                    "name": other["name"],
                    "target": other["name"],
                    "ra": other["ra"],
                    "dec": other["dec"],
                    "x_px": float(x_px),
                    "y_px": float(y_px),
                    "radius_px": float(radius_px),
                }
            )

    # Write out the regions YAML
    with open(out_file, "w") as f:
        yaml.safe_dump(regions, f, sort_keys=False)

    print(f"Wrote hotspot definitions to {out_file}")
