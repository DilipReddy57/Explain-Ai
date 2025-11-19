import matplotlib.pyplot as plt
import matplotlib
matplotlib.use('Agg')
import numpy as np
from io import BytesIO
import base64

def generate_concept_diagram(concept: str, description: str) -> str:
    """Generate a simple concept diagram"""
    fig, ax = plt.subplots(figsize=(10, 6), facecolor='#1a1f3a')
    ax.set_facecolor('#1a1f3a')
    
    # Create a simple visual representation
    ax.text(0.5, 0.7, concept, fontsize=24, color='#3B82F6', 
            ha='center', va='center', weight='bold', wrap=True)
    ax.text(0.5, 0.3, description[:150], fontsize=12, color='#94A3B8', 
            ha='center', va='center', wrap=True)
    
    # Add decorative elements
    circle = plt.Circle((0.5, 0.7), 0.15, color='#3B82F6', alpha=0.2)
    ax.add_patch(circle)
    
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    
    # Save to bytes
    buf = BytesIO()
    plt.savefig(buf, format='png', dpi=100, bbox_inches='tight', facecolor='#1a1f3a')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    
    return f"data:image/png;base64,{img_base64}"

def generate_architecture_diagram(approach: str) -> str:
    """Generate architecture/flow diagram"""
    fig, ax = plt.subplots(figsize=(12, 8), facecolor='#1a1f3a')
    ax.set_facecolor('#1a1f3a')
    
    # Create a simple flow diagram
    boxes = ['Input', 'Processing', 'Model', 'Output']
    y_pos = 0.5
    x_positions = np.linspace(0.15, 0.85, len(boxes))
    
    for i, (x, box) in enumerate(zip(x_positions, boxes)):
        # Draw box
        rect = plt.Rectangle((x-0.08, y_pos-0.08), 0.16, 0.16, 
                            fill=True, facecolor='#2d3748', 
                            edgecolor='#3B82F6', linewidth=2)
        ax.add_patch(rect)
        ax.text(x, y_pos, box, fontsize=12, color='#E2E8F0', 
                ha='center', va='center', weight='bold')
        
        # Draw arrow to next box
        if i < len(boxes) - 1:
            ax.arrow(x+0.09, y_pos, 0.06, 0, head_width=0.03, 
                    head_length=0.02, fc='#3B82F6', ec='#3B82F6')
    
    ax.text(0.5, 0.85, 'System Architecture', fontsize=16, 
            color='#3B82F6', ha='center', weight='bold')
    ax.text(0.5, 0.15, approach[:100], fontsize=10, 
            color='#94A3B8', ha='center', wrap=True)
    
    ax.set_xlim(0, 1)
    ax.set_ylim(0, 1)
    ax.axis('off')
    
    buf = BytesIO()
    plt.savefig(buf, format='png', dpi=100, bbox_inches='tight', facecolor='#1a1f3a')
    buf.seek(0)
    img_base64 = base64.b64encode(buf.read()).decode('utf-8')
    plt.close()
    
    return f"data:image/png;base64,{img_base64}"
