document.addEventListener('DOMContentLoaded', function () {
  const clusterList = document.getElementById('clusterList');

  let clustersData;

  fetch('clusters1_and_files.json')
    .then(response => response.json())
    .then(data => {
      clustersData = data;

      // Include Sortable.js library directly in the script
      const script = document.createElement('script');
script.src = 'https://cdnjs.cloudflare.com/ajax/libs/Sortable/1.14.0/Sortable.min.js';
document.body.appendChild(script);

script.onload = function () {
  // Initialize Sortable when the library is loaded
  const list = document.createElement('ul');
  list.id = 'documentList'; // Set id for the list
  list.style.cssText = 'margin: 0; padding: 0;';
  clusterList.appendChild(list); // Append the list to the clusterList element

  // Create sortable container for clusters
  const clusterContainer = document.createElement('div');
  clusterContainer.id = 'clusterContainer';
  list.appendChild(clusterContainer);

  for (let i = 1; i <= 10; i++) {
    const nodeItem = document.createElement('li');
    const clusterButton = document.createElement('button'); // Create button element
    clusterButton.textContent = `Cluster ${i}`; // Set button text content
    clusterButton.id = `Cluster ${i}`; // Set button id

    // Add mouseover and mouseout event listeners to add and remove the highlight class
    clusterButton.addEventListener('mouseover', function() {
      this.classList.add('highlight');
    });
    clusterButton.addEventListener('mouseout', () => {
      if (!clusterButton.classList.contains('active')) {
        clusterButton.classList.remove('highlight');
      }
    });

    // Modify the click event listener to toggle the highlight class
    clusterButton.addEventListener('click', function() {
      this.classList.toggle('active');
      toggleCluster(`Cluster ${i}`);
    });

    nodeItem.appendChild(clusterButton); // Append button to nodeItem

    // Create sublist
    const sublist = document.createElement('ul');
    sublist.id = `sublist${i}`; // Set id for the sublist
    sublist.classList.add('sortable-list'); // Add class for styling

    // Find the cluster with the id `Cluster ${i}`
    const cluster = data.nodes.find(node => node.id === `Cluster ${i}` && node.type === 'cluster');
    if (cluster) {
      // Use the files attribute of the cluster to create the sublist
      cluster.files.forEach(item => {
        const listItem = document.createElement('li');
        const subButton = document.createElement('button');
        subButton.textContent = item;
        subButton.id = item; // Set button id

        // Add mouseover and mouseout event listeners to add and remove the highlight class
        subButton.addEventListener('mouseover', function() {
          this.classList.add('highlight');
        });
        subButton.addEventListener('mouseout', () => {
          if (!subButton.classList.contains('active')) {
            subButton.classList.remove('highlight');
          }
        });

        // Modify the click event listener to toggle the highlight class
        subButton.addEventListener('click', function() {
          this.classList.toggle('active');
          toggleNode(item);
        });

        listItem.appendChild(subButton);
        sublist.appendChild(listItem);
      });
    }

    // Append sublist to nodeItem
    nodeItem.appendChild(sublist);

    // Append nodeItem to clusterContainer
    clusterContainer.appendChild(nodeItem);
  }

  // Initialize Sortable on the clusterContainer
  new Sortable(clusterContainer, {
    group: 'shared', // set both lists to same group
    animation: 150,
  });
}

      const workspace = document.querySelector('.workspace');
      const svg = d3.select('#diagram');

      const width = workspace.offsetWidth;
      const height = workspace.offsetHeight;

      const color = d3.scaleOrdinal(d3.schemeTableau10);

      const simulation = d3.forceSimulation(clustersData.nodes)
      .force('link', d3.forceLink(clustersData.links).id(d => d.id).distance(d => d.source.expanded || d.target.expanded ? 200 : 50))
      .force('charge', d3.forceManyBody().strength(-150))
      .force('x', d3.forceX(width / 2).strength(0.1))
      .force('y', d3.forceY(height / 2).strength(0.1))
      .force('collide', d3.forceCollide().radius(function(d) {
        if (d.type === 'file' && d.expanded) {
          // Calculate the collision radius as half the diagonal of the rectangle
          const width = 200; // The width of the expanded rectangle
          const height = 150; // The height of the expanded rectangle
          return Math.sqrt(width * width + height * height) / 2;
        } else {
          return 10;
        }
      }));

      const links = svg.append('g')
        .selectAll('line')
        .data(clustersData.links)
        .enter()
        .append('line')
        .style('stroke', 'lightgray')
        .style('stroke-width', 1);

      const nodes = svg.append('g')
        .selectAll('g')
        .data(clustersData.nodes)
        .enter()
        .append('g')
        .attr('id', d => `node-${d.id}`);

      nodes.each(function(d) {
        if (d.type === "cluster") {
          d3.select(this)
            .append('circle')
            .attr('r', 5);
        } else if (d.type === "file") {
          d3.select(this)
            .append('rect')
            .attr('width', 10)
            .attr('height', 10);
        }
      });

      nodes.attr('fill', d => color(d.cluster))
        .on('click', clicked)
        .call(d3.drag()
          .on('start', dragstarted)
          .on('drag', dragged)
          .on('end', dragended));

      simulation.force('collision', d3.forceCollide().radius(d => d.expanded ? 150 : 5));

      simulation.on('tick', () => {
        links.attr('x1', d => d.source.x)
          .attr('y1', d => d.source.y)
          .attr('x2', d => d.target.x)
          .attr('y2', d => d.target.y);

        nodes.attr('transform', d => {
          if (d.type === "cluster") {
            return `translate(${d.x}, ${d.y})`;
          } else if (d.type === "file") {
            return `translate(${d.x - (d.expanded ? 100 : 5)}, ${d.y - (d.expanded ? 50 : 5)})`;
          }
        });
      });

      function dragstarted(event, d) {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
      }

      function dragged(event, d) {
        d.fx = event.x;
        d.fy = event.y;
      }

      function dragended(event, d) {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      function clicked(event, d) {
        if (d.type === "cluster") {
          // Get all file nodes connected to the cluster node
          const fileNodes = clustersData.links
            .filter(link => link.source.id === d.id)
            .map(link => link.target);

          // Check if all connected file nodes are expanded
          const allExpanded = fileNodes.every(node => node.expanded);

          // If all connected file nodes are expanded, collapse them
          // Otherwise, expand them
          fileNodes.forEach(node => {
            if (node.type === "file") {
              node.expanded = allExpanded ? false : !node.expanded;
              toggleFileNode(null, node);
            }
          });

          // Update the link distance and restart the simulation
          simulation.force('link', d3.forceLink(clustersData.links).id(link => link.id).distance(link => {
            if (link.source.id === d.id || link.target.id === d.id) {
              return d.expanded ? 400 : 50; // Use 400 for expanded cluster nodes
            } else {
              return 50; // Use 50 for all other links
            }
          }));
          simulation.alpha(1).restart();
        } else if (d.type === "file") {
          toggleFileNode(event, d);
        }
      }
      function toggleCluster(clusterId) {
        // Find the cluster node
        const clusterNode = clustersData.nodes.find(node => node.id === clusterId && node.type === 'cluster');
        if (clusterNode) {
          // Get all file nodes connected to the cluster node
          const fileNodes = clustersData.links
            .filter(link => link.source.id === clusterNode.id)
            .map(link => link.target);

          // Check if all connected file nodes are expanded
          const allExpanded = fileNodes.every(node => node.expanded);

          // If all connected file nodes are expanded, collapse them
          // Otherwise, expand them
          fileNodes.forEach(node => {
            if (node.type === "file") {
              node.expanded = allExpanded ? false : !node.expanded;
              toggleFileNode(null, node);
            }
          });

          // Update the link distance and restart the simulation
          simulation.force('link', d3.forceLink(clustersData.links).id(link => link.id).distance(link => {
            if (link.source.id === clusterNode.id || link.target.id === clusterNode.id) {
              return clusterNode.expanded ? 400 : 50; // Use 400 for expanded cluster nodes
            } else {
              return 50; // Use 50 for all other links
            }
          }));
          simulation.alpha(1).restart();
        }
      }

      function toggleNode(nodeId) {
        // Find the file node
        const fileNode = clustersData.nodes.find(node => node.id === nodeId && node.type === 'file');
        if (fileNode) {
          toggleFileNode(null, fileNode);
        }
      }
      function toggleFileNode(event, d) {
        // If the clicked node is a file node, toggle its expanded state
        const element = event ? d3.select(event.currentTarget) : d3.select(`#node-${d.id}`);
        const rect = element.select('rect');

        if (!rect.empty() && rect.classed('expanded')) { // Check if the selection is not empty
          rect.classed('expanded', false);
          rect.attr('width', 10).attr('height', 10);
          d.expanded = false;
          collapseChildNodes(d);
        } else if (!rect.empty()) {
          rect.classed('expanded', true);
          rect.attr('width', 200).attr('height', 150);
          d.expanded = true;
          expandChildNodes(d);
          element.raise(); // Move the expanded node to the top
        }

        // Add or update the foreignObject element
        let foreignObject = element.select('foreignObject');
        if (foreignObject.empty()) {
          foreignObject = element.append('foreignObject')
            .attr('x', 10)
            .attr('y', 20)
            .attr('width', 180)
            .attr('height', 130);
          foreignObject.append('xhtml:body')
            .style('margin', 0)
            .append('div')
            .style('overflow', 'auto')
            .style('height', '130px')
            .text(d.content); // Use the 'content' attribute
        } else {
          foreignObject.attr('visibility', d.expanded ? 'visible' : 'hidden');
        }

        // Update the link distance and restart the simulation
        simulation.force('link', d3.forceLink(clustersData.links).id(link => link.id).distance(link => {
          if (link.source.id === d.id || link.target.id === d.id) {
            if (d.type === "file") {
              return d.expanded ? 200 : 50; // Use 200 for file nodes
            } else if (d.type === "cluster") {
              return d.expanded ? 500 : 50; // Use 500 for cluster nodes
            }
          } else {
            return 50;
          }
        }));
        simulation.alpha(1).restart();
      }
      
      function expandChildNodes(node) {
        const childNodes = clustersData.links
          .filter(link => link.source.name === node.name)
          .map(link => link.target);

        childNodes.forEach(childNode => {
          const childElement = d3.select(`circle#${childNode.name}`);
          childElement.classed('expanded', true);
          childElement.attr('r', 20);

          childElement.append('foreignObject')
            .attr('width', 100)
            .attr('height', 100)
            .append('xhtml:div')
            .attr('class', 'node-content')
            .text(childNode.content);
        });
      }

      function collapseChildNodes(node) {
        const childNodes = clustersData.links
          .filter(link => link.source.name === node.name)
          .map(link => link.target);

        childNodes.forEach(childNode => {
          const childElement = d3.select(`circle#${childNode.name}`);
          childElement.classed('expanded', false);
          childElement.attr('r', 5);
        });
      }

      fetch('mds_clusters_with_content_modified.json')
    .then(response => response.json())
    .then(mdsData => {        

        // Extract the positions from the nodes
        var positions = mdsData.nodes.map(node => [node.MDS1, node.MDS2]);

        // Extract the labels for the nodes
        var labels = mdsData.nodes.map(node => node.id);

        // Extract the distances between the nodes
        var distances = mdsData.links.map(link => link.distance);
        
        // Create a new SVG element for the MDS plot
        var mdsSvg = d3.select("body").append("svg")
            .attr("class", "mds-plot")
            .attr("width", 800)
            .attr("height", 600);

        // Create a group element to hold the plot
        var g = mdsSvg.append("g");

        // Create a scale for the positions
        var xScale = d3.scaleLinear()
            .domain(d3.extent(positions, d => d[0]))
            .range([0, 800]);

        var yScale = d3.scaleLinear()
            .domain(d3.extent(positions, d => d[1]))
            .range([600, 0]);

        // Create a color scale for the clusters
        var colorScale = d3.scaleOrdinal()
          .domain(d3.range(0, 10))
          .range(d3.schemeTableau10);

        var selectedNodes = new Set();
        
        // Add the nodes to the SVG
        var nodes = g.selectAll(".node")
          .data(mdsData.nodes)
          .enter()
          .append("circle")
          .attr("class", "node")
          .attr("cx", d => xScale(d.MDS1))
          .attr("cy", d => yScale(d.MDS2))
          .attr("r", 7)
          .attr("fill", d => colorScale(d.cluster))
          .attr("stroke", "gray")
          .attr("stroke-width", 1)
          .on("mouseover", (event, d) => {
            d3.select(event.currentTarget).attr('r', 14);
            var button = document.getElementById(d.id);
            if (button) {
              button.classList.add("highlight");
            }
          })
          .on('mouseout', (event, d) => {
            if (!selectedNodes.has(d.id)) {
              d3.select(event.currentTarget).attr('r', 7);
            }
            var button = document.getElementById(d.id);
            if (button && !selectedNodes.has(d.id)) {
              button.classList.remove('highlight');
            }
          })
          .on('click', (event, d) => {
            var button = document.getElementById(d.id);
            if (button) {
              button.click();
              if (selectedNodes.has(d.id)) {
                selectedNodes.delete(d.id);
                button.classList.remove('highlight');
                d3.select(event.currentTarget).attr('r', 7); // Revert the radius
              } else {
                selectedNodes.add(d.id);
                button.classList.add('highlight');
                d3.select(event.currentTarget).attr('r', 14); // Enlarge the radius
              }
            }
          });

      nodes.append("title")
          .text(d => `Name: ${d.id}\nCluster: ${d.cluster+1}`);

        // Define the zoom behavior
        var zoom = d3.zoom()
            .scaleExtent([0.9, 0.9]) // The scale extent restricts the scale factor
            .translateExtent([[0, 0], [800, 600]]) // The translate extent restricts the panning
            .on("zoom", function(event) {
                g.attr("transform", event.transform);
            });

        // Apply the zoom behavior to the SVG
        mdsSvg.call(zoom);

        // Set the initial zoom and pan
        var initialTransform = d3.zoomIdentity
            .scale(0.9) // Initial zoom
            .translate(40, 40); // Initial pan (panned down a little)

        mdsSvg.call(zoom.transform, initialTransform);
    })
    .catch(error => console.error('Error:', error));   
    })
    .catch(error => console.error('Error:', error)); 
});