---
title: "Virgo Conference"
description: "Information about the Virgo conference"
author: "Will Roper"
---

<p align="center">
  <img class="conference-logo" src="/assets/images/virgo-logo.png" alt="Virgo Consortiuum Logo">
</p>

# Conference Information

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
    var headers = document.querySelectorAll("h2, h3");
    var tocList = "<ul>";

    headers.forEach(function (header) {
        var title = header.innerText;
        var id = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "");
        header.id = id; // Assign an ID dynamically
        tocList += `<li><a href="#${id}">${title}</a></li>`;
    });

    tocList += "</ul>";
    tocContainer.innerHTML = tocList;
});
</script>

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

The university provides [comprehensive travel instructions](https://www.sussex.ac.uk/about/directions) for every transport method you could imagine.

### Specific Instructions:

- **By Bus from Brighton**: Take the **25** bus and get off at the **North South Road stop**, just up the road from the venue.
- **From Lewes**: Take the **29A**, **Regency 28**, or **Regency 29** to Falmer station, then walk to the campus (instructions below).
- **Driving**: **Please contact us immediately if you plan to drive so we can look into securing temporary permits**. I would discourage parking on campus is highly discouraged due to ongoing construction and limited availability.

## Travel to JMS Lecture Theatre

### From the Train Station:

1. Leave the station from the side without the massive stadium (the **A27** side).
2. Go under the underpass.
3. Continue past the concrete "University of Sussex" sign.
4. At the zebra crossing, turn right up the road (you should see **Sussex House** on your left and a car park on your right).
5. At the T-junction, you’ll see the medical school ahead. The lecture theatre is to the left of this building.

### From North South Road:

1. Walk **South** down the road.
2. The lecture theatre will be on your **left**.

### Entrance:

Enter through the doors highlighted in the photo below. Once inside, the lecture theatre is on your immediate right.

## Remote Attendance

We’ll use Zoom for sharing talks. This approach streamlines hybrid delivery and allows presenters to use their own machines.

## Speaker Information

- **Talk Duration**: 20 minutes total (15 minutes for the talk and 5 minutes for questions and changeover).
- **Zoom Instructions**: Share your screen to the Zoom meeting during your slot. For animations, ensure the "Optimize video sharing" option is selected.
- **Slide Testing**: Available 10 minutes before each session for anyone wanting to test their slides or connection.

## Social Events

We have planned several social events to foster collaboration and camaraderie:

### Tuesday, 21st:

- **Pub Quiz** at **Falmer Bar**, hosted by the LOC.
- Food and drinks are available at the bar, and deliveries from nearby establishments are common.
- The quiz starts at **19:00**. Rules will be shared closer to the time.

### Wednesday, 22nd:

- **Games Night**: Board games (donated by Peter Thomas) will be available on campus for those interested.

### Thursday, 23rd:

- **LaserZone Trip**: A tradition at Sussex Astronomy Centre.
  - [LaserZone Brighton](https://www.laserzone.co.uk/brighton/)
  - Prices: £8.50 (1 game) to £19.00 (3 games), depending on interest.
  - We will gauge interest during the meeting and book accordingly.

## Slack

During the meeting, the **Virgo Slack** will be the primary communication method.

- **Slack Workspace**: [virgo-network.slack.com](https://virgo-network.slack.com)
- **Invite Link**: [Join Virgo Slack](https://join.slack.com/t/virgo-network/shared_invite/zt-2vr4utc5v-rYKN5hRItGd8HiDW~XSvAQ)
