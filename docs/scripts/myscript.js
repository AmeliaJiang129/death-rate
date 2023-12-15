// add your JavaScript/D3 to this file
// Load data from CSV file
d3.csv("https://raw.githubusercontent.com/AmeliaJiang129/deathrate/main/data/clean/d3_clean.csv").then(function(data) {
  data.forEach(function(d) {
    d.Year = +d.Year;
    d.AverageDeathRate = +d.AverageDeathRate;
  });

  var margin = {top: 50, right: 180, bottom: 50, left: 60};
  var width = 800 - margin.left - margin.right;
  var height = 400 - margin.top - margin.bottom;

  var svg = d3.select("div#plot").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Extract unique locations and years
  var uniqueLocations = [...new Set(data.map(d => d.Location))];
  var uniqueYears = [...new Set(data.map(d => d.Year))];

  // Set up scales
  var x = d3.scaleBand()
      .domain(uniqueYears)
      .range([0, width])
      .padding(0.1);

  var y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.AverageDeathRate)])
      .range([height, 0]);

  // Set up color scale for locations
  var color = d3.scaleOrdinal()
      .domain(uniqueLocations)
      .range(d3.schemePaired);

  // Create bars
  svg.selectAll(".bar")
      .data(data)
      .enter().append("rect")
      .attr("class", "bar")
      .attr("x", d => x(d.Year) + x.bandwidth() / uniqueLocations.length * uniqueLocations.indexOf(d.Location))
      .attr("width", x.bandwidth() / uniqueLocations.length)
      .attr("y", d => y(d.AverageDeathRate))
      .attr("height", d => height - y(d.AverageDeathRate))
      .attr("fill", d => color(d.Location))
      .on("mouseover", ShowData)
      .on("mouseout", MouseOut);

  // Add X and Y axes
  svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(x));

  svg.append("g")
      .call(d3.axisLeft(y));

  // Add legend
  var legend = svg.selectAll(".legend")
      .data(color.domain())
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(" + (width + 10) + "," + i * 25 + ")"; }); // Moved legend to the right

  legend.append("rect")
      .attr("x", 0)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  legend.append("text")
      .attr("x", 24)  // Adjusted x-coordinate to move text to the right
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "start")  // Adjusted text anchor
      .text(function(d) { return d; });

  // Set title
  svg.append("text")
      .attr("x", width / 2)
      .attr("y", 0 - (margin.top / 2))
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Death Rate of Each Region Over Years");

  // Initialize tooltip
  const tooltip = d3.select("div#plot")
      .append("div")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background-color", "white");

  // Event handler for mouseover
  function ShowData(event, d) {
      const currentYearData = data.filter(item => item.Year === d.Year && item.Location === d.Location);
      const previousYearData = data.filter(item => (item.Year === (d.Year - 5) || item.Year === (d.Year - 4)) && item.Location === d.Location);

      const currentYearDeathRate = currentYearData.length > 0 ? currentYearData[0].AverageDeathRate : 0;
      const previousYearDeathRate = previousYearData.length > 0 ? previousYearData[0].AverageDeathRate : 0;

      const percentageChange = previousYearDeathRate !== 0
          ? ((currentYearDeathRate - previousYearDeathRate) / previousYearDeathRate) * 100
          : 0;

      tooltip.html(`<strong>Year:</strong> ${d.Year}<br>
                    <strong>Location:</strong> ${d.Location}<br>
                    <strong>AverageDeathRate:</strong> ${currentYearDeathRate.toFixed(4)}<br>
                    <strong>Percentage Change:</strong> ${percentageChange.toFixed(2)}%`)
          .style('visibility', 'visible');
  }

  // Event handler for mouseout
  function MouseOut(d) {
     tooltip.style('visibility','hidden');
  }

});
