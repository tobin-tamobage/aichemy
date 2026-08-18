"""
Generate direction icon images for the viewing direction selector.
Creates 4 icons with a yellow illustrated figure and directional arrows on dark gray background.
"""
from PIL import Image, ImageDraw
import math

# Configuration
SIZE = 800
BG_COLOR = (50, 50, 50)  # Dark gray background
YELLOW = (255, 220, 0)    # Yellow for figure and arrows
FIGURE_CENTER = (SIZE // 2, SIZE // 2)

def draw_blob_figure(draw, center_x, center_y, scale=1.0):
    """Draw a simple blob/character figure similar to the attachment"""
    # Main blob body (rounded trapezoid/mound shape)
    body_points = [
        (center_x - 80 * scale, center_y + 60 * scale),
        (center_x - 90 * scale, center_y),
        (center_x - 70 * scale, center_y - 60 * scale),
        (center_x - 30 * scale, center_y - 80 * scale),
        (center_x + 30 * scale, center_y - 80 * scale),
        (center_x + 70 * scale, center_y - 60 * scale),
        (center_x + 90 * scale, center_y),
        (center_x + 80 * scale, center_y + 60 * scale),
    ]
    draw.polygon(body_points, fill=YELLOW, outline=YELLOW)
    
    # Smooth the blob with ellipses
    draw.ellipse([center_x - 90 * scale, center_y - 80 * scale, 
                  center_x + 90 * scale, center_y + 60 * scale], 
                 fill=YELLOW, outline=YELLOW)
    
    # Simple face (two dots for eyes, simple smile)
    eye_left = (center_x - 25 * scale, center_y - 20 * scale)
    eye_right = (center_x + 25 * scale, center_y - 20 * scale)
    eye_size = 10 * scale
    
    draw.ellipse([eye_left[0] - eye_size, eye_left[1] - eye_size,
                  eye_left[0] + eye_size, eye_left[1] + eye_size], 
                 fill=BG_COLOR)
    draw.ellipse([eye_right[0] - eye_size, eye_right[1] - eye_size,
                  eye_right[0] + eye_size, eye_right[1] + eye_size], 
                 fill=BG_COLOR)
    
    # Simple smile
    mouth_y = center_y + 10 * scale
    draw.arc([center_x - 30 * scale, mouth_y - 15 * scale,
              center_x + 30 * scale, mouth_y + 15 * scale],
             start=0, end=180, fill=BG_COLOR, width=int(8 * scale))

def draw_arrow(draw, start_x, start_y, end_x, end_y, width=20):
    """Draw a thick arrow from start to end point"""
    # Calculate angle
    angle = math.atan2(end_y - start_y, end_x - start_x)
    
    # Arrow shaft
    draw.line([(start_x, start_y), (end_x, end_y)], fill=YELLOW, width=width)
    
    # Arrow head (triangle)
    head_length = 50
    head_width = 40
    
    # Calculate arrow head points
    point1 = (end_x, end_y)
    point2 = (
        end_x - head_length * math.cos(angle) + head_width * math.sin(angle),
        end_y - head_length * math.sin(angle) - head_width * math.cos(angle)
    )
    point3 = (
        end_x - head_length * math.cos(angle) - head_width * math.sin(angle),
        end_y - head_length * math.sin(angle) + head_width * math.cos(angle)
    )
    
    draw.polygon([point1, point2, point3], fill=YELLOW)

def create_direction_icon(direction):
    """Create an icon for the specified direction"""
    img = Image.new('RGB', (SIZE, SIZE), BG_COLOR)
    draw = ImageDraw.Draw(img)
    
    # Draw the blob figure in center
    draw_blob_figure(draw, SIZE // 2, SIZE // 2)
    
    # Arrow parameters
    arrow_distance = 220  # Distance from center to arrow start
    arrow_length = 120    # Length of arrow
    
    if direction == "from-the-front":
        # Arrow pointing down from top
        arrow_x = SIZE // 2
        arrow_start_y = SIZE // 2 - arrow_distance - arrow_length
        arrow_end_y = SIZE // 2 - arrow_distance
        draw_arrow(draw, arrow_x, arrow_start_y, arrow_x, arrow_end_y)
        
    elif direction == "from-the-back":
        # Arrow pointing up from bottom
        arrow_x = SIZE // 2
        arrow_start_y = SIZE // 2 + arrow_distance + arrow_length
        arrow_end_y = SIZE // 2 + arrow_distance
        draw_arrow(draw, arrow_x, arrow_start_y, arrow_x, arrow_end_y)
        
    elif direction == "from-the-left":
        # Arrow pointing right from left
        arrow_y = SIZE // 2
        arrow_start_x = SIZE // 2 - arrow_distance - arrow_length
        arrow_end_x = SIZE // 2 - arrow_distance
        draw_arrow(draw, arrow_start_x, arrow_y, arrow_end_x, arrow_y)
        
    elif direction == "from-the-right":
        # Arrow pointing left from right
        arrow_y = SIZE // 2
        arrow_start_x = SIZE // 2 + arrow_distance + arrow_length
        arrow_end_x = SIZE // 2 + arrow_distance
        draw_arrow(draw, arrow_start_x, arrow_y, arrow_end_x, arrow_y)
    
    return img

# Generate all four direction icons
directions = ["from-the-front", "from-the-back", "from-the-left", "from-the-right"]

for direction in directions:
    print(f"Creating {direction}.jpg...")
    img = create_direction_icon(direction)
    output_path = f"public/images/directions/{direction}.jpg"
    img.save(output_path, "JPEG", quality=95)
    print(f"  Saved to {output_path}")

print("\nAll direction icons created successfully!")
