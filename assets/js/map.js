function getRandomColor() {
  var colors = [
		"#d53e4f", "#fc8d59", "#fee08b", "#e6f598", "#99d594"
    // "#1192e8", "#33b1ff", "#82cfff", "#bae6ff", "#e5f6ff"
	];
	var color = colors[Math.floor(Math.random() * colors.length)];
	return color;
}

function getRandomAQI() {
	return Math.floor(Math.random() * 500) + 1;
}

function style(feature) {
  return {
    weight: 1,
		dashArray: '2',
    color: "#FFF",
		opacity: 1,
		fillColor: getRandomColor(),
    fillOpacity: 0.7
  };
}

var boroughs = L.layerGroup();
var lsoa = L.layerGroup();
var cell_towers = L.layerGroup();

// Show Southwark and Lambeth boroughs
L.geoJSON(london_boroughs, {style: style}).addTo(boroughs);

// LSOA
L.geoJSON(lambeth_lsoa, {style: style}).addTo(lsoa);
L.geoJSON(southwark_lsoa, {style: style}).addTo(lsoa);
L.geoJSON(london_boroughs, {
	style: {
    weight: 1,
    dashArray: '2',
    color: "#000",
    opacity: 1,
    fillOpacity: 0
  },

	filter: function (feature, layer) {
		if (feature.properties) {

			// If Southwark or Lambeth, then show
			if (feature.properties.id == 11 || feature.properties.id == 12) {
				return true;
			}
		}
		return false;
	}
}).addTo(lsoa);

var mbAttr = 'Map data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, ' +
		'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
		mbUrl = 'https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw';

var grayscale = L.tileLayer(mbUrl, {id: 'mapbox/light-v9', tileSize: 512, zoomOffset: -1, attribution: mbAttr});

var map = L.map('mapid', {
	center: [51.46, -0.1],
	maxZoom: 18,
	zoom: 13,
	zoomOffset: -1,
	layers: [grayscale, boroughs, lsoa]
});

var overlays = {
	"Boroughs": lsoa,
	"LSOA": lsoa,
  "Street level": lsoa
};

L.control.layers(overlays).addTo(map);

// control that shows state info on hover
var info = L.control();

info.onAdd = function (mymap) {
	this._div = L.DomUtil.create('div', 'info');
  // this._div = L.DomUtil.get('detail-overlay');
	this.update();
	return this._div;
};

info.update = function (props) {
	this._div.innerHTML = (props ?
		'<b>' + props.LSOA11NM + '</b><br />' + getRandomAQI() + ' AQI'
		: 'Hover over a LSOA');
};

info.addTo(map);

// Hover and click
function highlightFeature(e) {
	var layer = e.target;

	layer.setStyle({
		weight: 3,
		color: '#666',
		dashArray: '',
		fillOpacity: 0.7
	});

	if (!L.Browser.ie && !L.Browser.opera && !L.Browser.edge) {
		layer.bringToFront();
	}

	info.update(layer.feature.properties);
}

var geojson;

function resetHighlight(e) {
	geojson.resetStyle(e.target);
	info.update();
}

function zoomToFeature(e) {
	map.fitBounds(e.target.getBounds());
}

function onEachFeature(feature, layer) {
	layer.on({
		mouseover: highlightFeature,
		mouseout: resetHighlight,
		// click: zoomToFeature
	});
}

geojson = L.geoJson(southwark_lsoa, {
	style: style,
	onEachFeature: onEachFeature
}).addTo(map);

geojson = L.geoJson(lambeth_lsoa, {
	style: style,
	onEachFeature: onEachFeature
}).addTo(map);
