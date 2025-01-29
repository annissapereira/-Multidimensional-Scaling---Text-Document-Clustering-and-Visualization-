# Document Clustering and Visualization

## Overview
This project leverages **Multidimensional Scaling (MDS)** as a dimensionality reduction technique to enable visualization of document similarities in a lower-dimensional space. By reducing the dimensionality of the **TF-IDF matrix**, MDS captures the pairwise distances or dissimilarities between documents while preserving their original relationships. This approach facilitates the exploration of clustering patterns and the structure of the document dataset, aiding in better understanding and analysis of the content across various dimensions.

## Features
1. **Content-Based Clustering:**
   - Tokenizes documents using spaCy with a focus on specific entity types (e.g., "DATE," "PERSON," "GPE," "ORG," and "NORP").
   - Groups documents into clusters based on content similarity using **K-Means clustering**.

2. **Dimensionality Reduction:**
   - Applies **MDS** to reduce the dimensionality of the **TF-IDF matrix**, making it suitable for visualization while preserving document relationships.

3. **Visualization:**
   - Generates a scatter plot to visualize clustered documents in a 2D space.
   - Each point represents a document, color-coded by its assigned cluster.

4. **Cluster Analysis:**
   - Identifies and analyzes the top 5 most common entities within each cluster to derive thematic insights.

---

## Workflow

### 1. Data Extraction
Extracts text content from documents in a specified folder for processing and analysis.

### 2. Tokenization and Clustering
- **Tokenization:**
  - Uses spaCy to tokenize document content, focusing on predefined entity types.
  - Entities extracted include:
    - "DATE"
    - "PERSON"
    - "GPE" (Geopolitical Entities)
    - "ORG" (Organizations)
    - "NORP" (Nationalities, Religions, or Political Groups).

- **Clustering:**
  - Applies **K-Means clustering** to group similar documents.
  - Produces 10 clusters representing documents with similar content.

### 3. Dimensionality Reduction with MDS
Reduces the dimensionality of the **TF-IDF matrix** using **MDS**, maintaining pairwise relationships between documents for better visualization.

### 4. Visualization
- Visualizes the reduced-dimensional data in a 2D scatter plot.
- Points are color-coded by cluster assignments to highlight grouping patterns.

### 5. Cluster Analysis
Analyzes the top 5 most frequent entities in each cluster to understand the main themes or topics within the grouped documents.

---

## Installation

### Prerequisites
- Python 3.8+
- Install the required Python packages:

```bash
pip install -r requirements.txt
```

### Required Libraries
- **spaCy**
- **scikit-learn**
- **matplotlib**
- **numpy**
- **pandas**

### Setting Up spaCy
Download the spaCy model:
```bash
python -m spacy download en_core_web_sm
```

---

## Usage
1. Place the documents to be analyzed in the designated folder (e.g., `documents/`).
2. Run the script to process the documents and generate results:
   ```bash
   python main.py
   ```
3. View the generated scatter plot and cluster analysis output.

---

## Results
- Scatter plot showcasing document clusters.
- Top 5 common entities for each cluster, providing thematic insights into the grouped documents.

---

## Example Output
### Scatter Plot
Each point represents a document, color-coded by its cluster:

![Scatter Plot Example](path/to/example_scatter_plot.png)

### Cluster Analysis Table
| Cluster ID | Top Entities |
|------------|--------------|
| 0          | ["John", "2022", "New York", "Company A", "United States"] |
| 1          | ["Jane", "2023", "London", "Organization B", "UK"]         |

---

## Contributing
Contributions are welcome! To contribute:
1. Fork the repository.
2. Create a new branch:
   ```bash
   git checkout -b feature-name
   ```
3. Commit your changes and submit a pull request.

---

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

