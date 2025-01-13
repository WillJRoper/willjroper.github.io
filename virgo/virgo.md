---
title: "Virgo Conference"
description: "Information about the Virgo conference"
author: "Will Roper"
---

<p align="center">
  <img class="conference-logo" src="/assets/images/virgo-logo.png" alt="Virgo Consortiuum Logo">
</p>

# Virgo Meeting 2025

<h2 onclick="toggleToc()" style="cursor: pointer;">
    ▶ Table of Contents
</h2>
<div id="toc-container" style="display: none;"></div>

<script>
function toggleToc() {
    var toc = document.getElementById("toc-container");
    var heading = event.target;
    if (toc.style.display === "none") {
        toc.style.display = "block";
        heading.innerHTML = "▼ Table of Contents";
    } else {
        toc.style.display = "none";
        heading.innerHTML = "▶ Table of Contents";
    }
}

// Auto-generate the Table of Contents
document.addEventListener("DOMContentLoaded", function () {
    var tocContainer = document.getElementById("toc-container");
    var headers = document.querySelectorAll("h2"); // Select only h2 headers
    var tocList = "<ul>";

    headers.forEach(function (header) {
        if (header.innerText.includes("Table of Contents")) return; // Ignore TOC itself
        var title = header.innerText;
        var id = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
        header.id = id; // Assign an ID dynamically
        tocList += `<li><a href="#${id}">${title}</a></li>`;
    });

    tocList += "</ul>";
    tocContainer.innerHTML = tocList;
});
</script>

## Schedule

<style>
    .spreadsheet-container {
        width: 100%;
        max-width: 1000px;
        height: 600px;
        margin: auto;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
    }
    .spreadsheet-container iframe {
        transform: scale(0.8); /* Scale down */
        transform-origin: top left;
        width: 125%; /* Compensate for scaling */
        height: 125%;
        border: none;
    }
</style>

<div class="spreadsheet-container">
    <iframe src="https://docs.google.com/spreadsheets/d/e/2PACX-1vSHSaH0Ea2GOTSLVIhTcmQ3pG8LPb5WOQvBtnp6ndPM2k2UsFJL0SRAdJzW2Hxop7w_puLGwn08vtZc/pubhtml?gid=377391167&amp;single=true&amp;widget=true&amp;headers=false"></iframe>
</div>

## Slack

During the meeting, the **Virgo Slack** will be the primary communication method.

- **Slack Workspace**: [virgo-network.slack.com](https://virgo-network.slack.com)
- **Invite Link**: [Join Virgo Slack](https://join.slack.com/t/virgo-network/shared_invite/zt-2vr4utc5v-rYKN5hRItGd8HiDW~XSvAQ)

## Location

The meeting will take place in the JMS lecture theatre:

**JMS Lecture Theatre**  
North South Road  
University of Sussex  
Brighton  
East Sussex  
BN1 9PU

- [Exact location on Google Maps](https://maps.app.goo.gl/diqi6afjvupVqF5o8)
- What3words: [///swift.line.toys](https://w3w.co/swift.line.toys)

## Travel to Campus

The university provides [comprehensive travel instructions](https://www.sussex.ac.uk/about/directions) for almost every transport method you could desire.

### More Specific Instructions:

- **By Train from Brighton/Lewes**: Take a train to Falmer station and walk to campus (instructions below).
- **By Bus from Brighton**: Take the **25** bus and get off at the **North South Road stop**, just up the road from the venue.
- **From Bus from Lewes**: Take the **29A**, **Regency 28**, or **Regency 29** to Falmer station, then walk to the campus (instructions below).
- **Driving**: **Please contact us immediately if you plan to drive so we can look into securing temporary permits**. I would discourage parking on campus is highly discouraged due to ongoing construction and limited availability.

## Finding the venue

### From the Train Station:

1. Leave the station from the side without the massive stadium (the A27 side).
2. Go under the underpass.
3. Continue past the concrete "University of Sussex" sign.
4. At the zebra crossing, turn right up the road (you should see **Sussex House** on your left and a car park on your right).
5. At the T-junction, you’ll see the medical school ahead. The lecture theatre is to the left of this building.

### From North South Road:

1. Walk **South** down the road.
2. The lecture theatre will be on your **left**.

### Finding the lecture theatre

Enter through the doors highlighted in the photo below. Once inside, the lecture theatre is on your immediate right.

<p align="center">
  <img class="jms" src="/assets/images/IMG_1331.jpeg" alt="JMS Lecture Theatre">
</p>

## Remote Attendance

We’ll use Zoom so that people couldn't make it can still take part. This link is:

Please do share these details with anyone who may be interested.

## Speaker Information

- **Talk Duration**: 20 minutes total (15 minutes for the talk and 5 minutes for questions and changeover).
- **Zoom Instructions**: Share your screen to the Zoom meeting during your slot. For animations, ensure the "Optimize video sharing" option is selected.
- **Slide Testing**: Available 10 minutes before each session for anyone wanting to test their slides or connection.

## Social Events

We will not be having a traditional conference dinner during the meeting. We came to this decision for several reasons but primarily because Virgo dinners have traditionally been free and we do not have the funds to continue this tradition. Instead, we are planning social events to bring everyone together and fuel collaboration.

### Tuesday, 21st:

- **Pub Quiz** at **Falmer Bar**, hosted by the LOC.
- Food and drinks are available at the bar, and deliveries from nearby establishments are common.
- The quiz starts at **19:00**. Rules will be shared closer to the time by the quizmasters.

### Wednesday, 22nd:

- **Games Night**: Board games (donated by Peter Thomas) will be available on campus for those interested.

### Thursday, 23rd:

- **LaserZone Trip** (a graduation tradition in the Sussex Astronomy Centre)
  - [LaserZone Brighton](https://www.laserzone.co.uk/brighton/)
  - Prices: £8.50 (1 game) to £19.00 (3 games).
  - We will gauge interest during the meeting and book accordingly.
