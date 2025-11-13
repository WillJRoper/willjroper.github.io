#!/usr/bin/env python3
"""
Optimize images for web by reducing file size while maintaining visual quality.
"""

from PIL import Image
import os
import sys

def optimize_image(input_path, output_path=None, quality=85, max_dimension=2000):
    """
    Optimize an image by:
    - Converting PNG to JPEG
    - Reducing quality to specified level
    - Optionally resizing if dimensions exceed max_dimension

    Args:
        input_path: Path to input image
        output_path: Path to output image (defaults to input_path)
        quality: JPEG quality (0-100, default 85)
        max_dimension: Maximum width or height in pixels
    """
    if output_path is None:
        output_path = input_path

    # Open image
    img = Image.open(input_path)

    # Convert RGBA to RGB if needed (for PNG with transparency)
    if img.mode in ('RGBA', 'LA', 'P'):
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
        img = background
    elif img.mode != 'RGB':
        img = img.convert('RGB')

    # Get original size
    width, height = img.size
    original_size = os.path.getsize(input_path) / (1024 * 1024)  # MB

    # Resize if too large
    if max(width, height) > max_dimension:
        ratio = max_dimension / max(width, height)
        new_width = int(width * ratio)
        new_height = int(height * ratio)
        img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        print(f"  Resized from {width}x{height} to {new_width}x{new_height}")

    # Save as optimized JPEG
    img.save(output_path, 'JPEG', quality=quality, optimize=True)

    new_size = os.path.getsize(output_path) / (1024 * 1024)  # MB
    reduction = ((original_size - new_size) / original_size) * 100

    print(f"  {original_size:.2f} MB -> {new_size:.2f} MB (reduced by {reduction:.1f}%)")

    return new_size


def main():
    pictures_dir = 'pictures'

    # Images to optimize (the large ones)
    images_to_optimize = [
        ('our_universe.png', 'our_universe.jpeg', 85, 2000),
        ('euclid_fos.jpeg', 'euclid_fos.jpeg', 85, 2000),
        ('euclid_fox_close_up.jpeg', 'euclid_fox_close_up.jpeg', 85, 2000),
        ('euclid_fos_close_up.jpeg', 'euclid_fos_close_up.jpeg', 85, 2000),
        ('SuperSimulator.jpeg', 'SuperSimulator.jpeg', 85, 2000),
        ('fos_jwst.jpeg', 'fos_jwst.jpeg', 85, 2000),
        ('profile.jpeg', 'profile.jpeg', 85, 1500),
        ('cosmos_in_focus.jpeg', 'cosmos_in_focus.jpeg', 85, 2000),
        ('gravylensing_demo.jpeg', 'gravylensing_demo.jpeg', 85, 2000),
        ('bluedot.jpeg', 'bluedot.jpeg', 85, 2000),
    ]

    total_saved = 0

    for input_name, output_name, quality, max_dim in images_to_optimize:
        input_path = os.path.join(pictures_dir, input_name)
        output_path = os.path.join(pictures_dir, output_name)

        if not os.path.exists(input_path):
            print(f"Skipping {input_name} (not found)")
            continue

        print(f"\nOptimizing {input_name}...")
        original_size = os.path.getsize(input_path) / (1024 * 1024)

        try:
            new_size = optimize_image(input_path, output_path, quality, max_dim)
            total_saved += (original_size - new_size)
        except Exception as e:
            print(f"  Error: {e}")

    print(f"\n{'='*60}")
    print(f"Total space saved: {total_saved:.2f} MB")
    print(f"{'='*60}")


if __name__ == '__main__':
    main()
