// default x and y axes
var defaultXAxis = "poverty";
var defaultYAxis = "healthcare";

// function for updating x scale on click 
function xScale(data, defaultXAxis, chartWidth) {
    // create scale
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[defaultXAxis]) * .8,
            d3.max(data, d => d[defaultXAxis]) * 1.1])
        .range([0, chartWidth]);
    return xLinearScale;
}

// function for updating x axis on click 
function renderXAxes(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);
    return xAxis;
}

// function updating y-scale var on axis label click
function yScale(data, defaultYAxis, chartHeight) {
    // create scales
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(data, d => d[defaultYAxis]) * .8,
            d3.max(data, d => d[defaultYAxis]) * 1.2])
        .range([chartHeight, 0]);
    return yLinearScale;
}

// function updating yAxis var on axis label click
function renderYAxes(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale);
    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    return yAxis;
}

// function updating circles group, transition to new circles
function renderCircles(circlesGroup, newXScale, newYScale, defaultXAxis, defaultYAxis) {
    circlesGroup.transition()
        .duration(1000)
        .attr("cx", d => newXScale(d[defaultXAxis]))
        .attr("cy", d => newYScale(d[defaultYAxis]));
    return circlesGroup;
}

// function updating text in circles group, transition to new text
function renderText(circleTextGroup, newXScale, newYScale, defaultXAxis, defaultYAxis) {
    circleTextGroup.transition()
        .duration(1000)
        .attr("x", d => newXScale(d[defaultXAxis]))
        .attr("y", d => newYScale(d[defaultYAxis]));
    return circleTextGroup;
}

// function updating circles group with tooltip
function updateToolTip(defaultXAxis, defaultYAxis, circlesGroup, textGroup) {
    // Conditional for X Axis.
    if (defaultXAxis === "poverty") {
        var xlabel = "Poverty: ";
    } else if (defaultXAxis === "income") {
        var xlabel = "Median Income: "
    } else {
        var xlabel = "Age: "
    }
    // conditions for y axis
    if (defaultYAxis === "healthcare") {
        var ylabel = "Lacks Healthcare: ";
    } else if (defaultYAxis === "smokes") {
        var ylabel = "Smokers: "
    } else {
        var ylabel = "Obesity: "
    }
    // define tooltip
    var toolTip = d3.tip()
        .offset([120, -60])
        .attr("class", "d3-tip")
        .html(function(d) {
            if (defaultXAxis === "age") {
                // formatting labels:
                // age 
                return (`${d.state}<hr>${xlabel} ${d[defaultXAxis]}<br>${ylabel}${d[defaultYAxis]}%`);
                } else if (defaultXAxis !== "poverty" && defaultXAxis !== "age") {
                // income ($)
                return (`${d.state}<hr>${xlabel}$${d[defaultXAxis]}<br>${ylabel}${d[defaultYAxis]}%`);
                } else {
                // poverty (%)
                return (`${d.state}<hr>${xlabel}${d[defaultXAxis]}%<br>${ylabel}${d[defaultYAxis]}%`);
                }      
        });
    circlesGroup.call(toolTip);

    // create mouseover/out event listeners
    circlesGroup
        .on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        .on("mouseout", function(data) {
            toolTip.hide(data);
        });
    textGroup
        .on("mouseover", function(data) {
            toolTip.show(data, this);
        })
        .on("mouseout", function(data) {
            toolTip.hide(data);
        });
    return circlesGroup;
}

function makeResponsive() {
    // select div
    var svgArea = d3.select("#scatter").select("svg");

    // clear SVG area
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // SVG area
    var svgHeight = window.innerHeight/1.2;
    var svgWidth = window.innerWidth/1.7;

    // SVG margins
    var margin = {
        top: 50,
        right: 50,
        bottom: 100,
        left: 80
    };

    // chart area - margins
    var chartHeight = svgHeight - margin.top - margin.bottom;
    var chartWidth = svgWidth - margin.left - margin.right;

    // create scatter SVG
    var svg = d3
    .select("#scatter")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight);

    // append SVG group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
    d3.csv("assets/data/data.csv").then(function(demoData, err) {
        if (err) throw err;

        // parse data
        demoData.forEach(function(data) {
            data.poverty = +data.poverty;
            data.healthcare = +data.healthcare;
            data.age = +data.age;
            data.smokes = +data.smokes;
            data.income = +data.income;
            data.obesity = +data.obesity;
        });

        // create linear scales.
        var xLinearScale = xScale(demoData, defaultXAxis, chartWidth);
        var yLinearScale = yScale(demoData, defaultYAxis, chartHeight);

        // create starting axises
        var bottomAxis =d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // append x axis
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${chartHeight})`)
            .call(bottomAxis);

        // append y axis
        var yAxis = chartGroup.append("g")
            .call(leftAxis);

        // select data for circles
        var circlesGroup = chartGroup.selectAll("circle")
            .data(demoData);

        // bind data to circles
        var elemEnter = circlesGroup.enter();

        // create circles
        var circle = elemEnter.append("circle")
            .attr("cx", d => xLinearScale(d[defaultXAxis]))
            .attr("cy", d => yLinearScale(d[defaultYAxis]))
            .attr("r", 15)
            .classed("stateCircle", true);

        // create circle text
        var circleText = elemEnter.append("text")            
            .attr("x", d => xLinearScale(d[defaultXAxis]))
            .attr("y", d => yLinearScale(d[defaultYAxis]))
            .attr("dy", ".35em") 
            .text(d => d.abbr)
            .classed("stateText", true);

        // update tool tip 
        var circlesGroup = updateToolTip(defaultXAxis, defaultYAxis, circle, circleText);

        // add x label groups and labels
        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);
        var povertyLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 20)
            .attr("value", "poverty") // value for event listener
            .classed("active", true)
            .text("In Poverty (%)");
        var ageLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 40)
            .attr("value", "age") // value for event listener
            .classed("inactive", true)
            .text("Age (Median)");
        var incomeLabel = xLabelsGroup.append("text")
            .attr("x", 0)
            .attr("y", 60)
            .attr("value", "income") // value for event listener
            .classed("inactive", true)
            .text("Household Income (Median)");

        // add y labels group and labels
        var yLabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");
        var healthcareLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 40 - margin.left)
            .attr("dy", "1em")
            .attr("value", "healthcare")
            .classed("active", true)
            .text("Lacks Healthcare (%)");
        var smokesLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 20 - margin.left)
            .attr("dy", "1em")
            .attr("value", "smokes")
            .classed("inactive", true)
            .text("Smokes (%)");
        var obeseLabel = yLabelsGroup.append("text")
            .attr("x", 0 - (chartHeight / 2))
            .attr("y", 0 - margin.left)
            .attr("dy", "1em")
            .attr("value", "obesity")
            .classed("inactive", true)
            .text("Obese (%)");

        // x labels event listener
        xLabelsGroup.selectAll("text")
            .on("click", function() {
                // get selected label
                defaultXAxis = d3.select(this).attr("value");

                // update xLinearScale
                xLinearScale = xScale(demoData, defaultXAxis, chartWidth);

                // render xAxis
                xAxis = renderXAxes(xLinearScale, xAxis);

                // set active/inactive labels
                if (defaultXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (defaultXAxis === "age") {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true)
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }

                // update circles
                circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, defaultXAxis, defaultYAxis);

                // update tool tip
                circlesGroup = updateToolTip(defaultXAxis, defaultYAxis, circle, circleText);

                // update circle text
                circleText = renderText(circleText, xLinearScale, yLinearScale, defaultXAxis, defaultYAxis);
            });

        // y labels event listener
        yLabelsGroup.selectAll("text")
            .on("click", function() {

                // get selected label
                defaultYAxis = d3.select(this).attr("value");

                // update yLinearScale
                yLinearScale = yScale(demoData, defaultYAxis, chartHeight);

                // render yAxis 
                yAxis = renderYAxes(yLinearScale, yAxis);

                // set active/inactive labels
                if (defaultYAxis === "healthcare") {
                    healthcareLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else if (defaultXAxis === "smokes"){
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    obeseLabel
                        .classed("active", false)
                        .classed("inactive", true);
                } else {
                    healthcareLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    smokesLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    obeseLabel
                        .classed("active", true)
                        .classed("inactive", false);
                }

                // update circles
                circle = renderCircles(circlesGroup, xLinearScale, yLinearScale, defaultXAxis, defaultYAxis);

                // update tool tips
                circlesGroup = updateToolTip(defaultXAxis, defaultYAxis, circle, circleText);

                // update circles text 
                circleText = renderText(circleText, xLinearScale, yLinearScale, defaultXAxis, defaultYAxis);
                
            });
    }).catch(function(err) {
        console.log(err);
    });
}

makeResponsive();

// event listener for window resizes
d3.select(window).on("resize", makeResponsive);



