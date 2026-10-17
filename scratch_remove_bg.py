import sys
from PIL import Image, ImageFilter
import numpy as np
from collections import deque

def remove_background(input_path, output_path, tolerance=25):
    img = Image.open(input_path).convert("RGBA")
    arr = np.array(img)
    h, w = arr.shape[:2]

    # Mask of visited background pixels
    visited = np.zeros((h, w), dtype=bool)
    
    # We flood fill from all 4 borders where pixel is near white
    queue = deque()
    
    def is_white(r, g, b):
        return r >= (255 - tolerance) and g >= (255 - tolerance) and b >= (255 - tolerance)

    for x in range(w):
        for y in [0, h - 1]:
            r, g, b, _ = arr[y, x]
            if is_white(r, g, b) and not visited[y, x]:
                visited[y, x] = True
                queue.append((y, x))
                
    for y in range(h):
        for x in [0, w - 1]:
            r, g, b, _ = arr[y, x]
            if is_white(r, g, b) and not visited[y, x]:
                visited[y, x] = True
                queue.append((y, x))

    while queue:
        cy, cx = queue.popleft()
        for dy, dx in [(-1, 0), (1, 0), (0, -1), (0, 1)]:
            ny, nx = cy + dy, cx + dx
            if 0 <= ny < h and 0 <= nx < w and not visited[ny, nx]:
                r, g, b, _ = arr[ny, nx]
                if is_white(r, g, b):
                    visited[ny, nx] = True
                    queue.append((ny, nx))

    # visited are exterior white pixels -> make transparent
    arr[visited, 3] = 0
    
    result = Image.fromarray(arr)
    result.save(output_path, "PNG")
    print(f"Saved transparent PNG to {output_path}")

if __name__ == "__main__":
    remove_background(sys.argv[1], sys.argv[2])
