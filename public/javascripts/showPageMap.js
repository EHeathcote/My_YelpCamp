mapboxgl.accessToken = mapToken;
const map = new mapboxgl.Map({
    container: 'map', // container ID
    style: 'mapbox://styles/mapbox/streets-v11', // style URL
    center: campground.geometry.coordinates, // starting position [lng, lat]
    zoom: 9, // starting zoom
    projection: 'globe' // display the map as a 3D globe
});
map.on('style.load', () => {
map.setFog({}); // Set the default atmosphere style
});

// Add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// adding in a pin(marker) 
new mapboxgl.Marker()
    // first setting the lat and lng of the marker
    .setLngLat(campground.geometry.coordinates)
    // second setting the popup that goes on the marker
    .setPopup(
        new mapboxgl.Popup({offset: 25})
        .setHTML(
            `<h3>${campground.title}</h3>
            <p>${campground.location}</p>`
        ) 
    )
    // finally adding the marker to the map
    .addTo(map);