function mergeByFillColor(doc) {
    var colorGroups = {};

    for (var i = 0; i < doc.pathItems.length; i++) {
        var item = doc.pathItems[i];
        if (!item.closed || item.guides || item.clipping) continue;
        if (!item.filled || item.fillColor.typename === "NoColor") continue;

        var colorKey = getColorKey(item.fillColor);
        if (!(colorKey in colorGroups)) colorGroups[colorKey] = [];
        colorGroups[colorKey].push(item);
    }

    for (var key in colorGroups) {
        var paths = colorGroups[key];
        if (paths.length < 2) continue;

        var tempGroup = doc.groupItems.add();
        for (var i = 0; i < paths.length; i++) {
            paths[i].move(tempGroup, ElementPlacement.PLACEATEND);
        }

        app.selection = null;
        tempGroup.selected = true;

        app.executeMenuCommand("Pathfinder Merge");
        app.executeMenuCommand("expandStyle");
        app.executeMenuCommand("ungroup");
    }
}

function getColorKey(color) {
    if (color.typename === "RGBColor") {
        return "RGB(" + color.red + "," + color.green + "," + color.blue + ")";
    } else if (color.typename === "CMYKColor") {
        return (
            "CMYK(" +
            color.cyan +
            "," +
            color.magenta +
            "," +
            color.yellow +
            "," +
            color.black +
            ")"
        );
    } else if (color.typename === "GrayColor") {
        return "GRAY(" + color.gray + ")";
    } else {
        return "UNKNOWN";
    }
}

// Main
if (app.documents.length > 0) {
    mergeByFillColor(app.activeDocument);
    alert("Merge complete!");
}
