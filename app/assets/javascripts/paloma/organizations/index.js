$(document).ready(function(){
  Paloma.start();
});

Paloma.controller('Organizations', {
  index: function(){

    //Hide the organization listing table with links to show page
    $('#tbl-allorg').hide();

    //All organizations and their information acquired from the controller
    var organizations = this.params.organizations;
    // console.log(organizations)
    //All organization names
    var orgNames = _.pluck(organizations, 'name');

    //Marker layers for all organizations and the searched organization
    var layerAllOrgs = [],
        layerSearchedOrg = [];

    //Load the basemap
    var mapAllOrgs = L.map('map-all-orgs', {
      center: [34.0522, -118.2437],
      zoom: 10
    });
    var Stamen_TonerLite = L.tileLayer('http://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}@2x.png', {
      attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      minZoom: 0,
      maxZoom: 20,
      ext: 'png'
    }).addTo(mapAllOrgs);

    //Add markers for all organization
    var dataAllOrgs = _.chain(organizations)
      .filter(function(organization){
        return organization.latitude != null;
      })
      .map(function(organization) {
        organization.marker = L.marker([organization.latitude, organization.longitude],
                                       { icon: L.divIcon({ className: organization.org_type.split(',')[0].split(' ')[0] }) })
                               .bindPopup(organization.name)
                               .on('click', function() {
                                 mapAllOrgs.setView([organization.latitude, organization.longitude], 11);
                                 $('#tbl-org-searched').empty();
                                 $("#tbl-allorg #row-"+organization.id).clone().appendTo('#tbl-org-searched');
                               });
        return organization;
      })
      .value();

    // Plot all organization markers onto the maop
    layerAllOrgs = _.map(dataAllOrgs, function(organization) { return organization.marker.addTo(mapAllOrgs); });

    //The search box autocomplete
    $( "#searchbox-org-name" ).autocomplete({
      source: orgNames
    });

    //Search button clicked behaviors
    $('#btn-org-search').on('click',function(){
      //Get the input organization name
      var inputOrgName = $( "#searchbox-org-name" ).val();
      //clear the all organizations and the searched organization marker layer
      if(layerSearchedOrg || layerAllOrgs){
        _.each(layerAllOrgs, function(eachLayer){
          mapAllOrgs.removeLayer(eachLayer);
        });
        _.each(layerSearchedOrg, function(eachLayer){
          mapAllOrgs.removeLayer(eachLayer);
        });
        layerAllOrgs = [];
        layerSearchedOrg = [];
      }
      //clear the organization information table on the sidebar
      $('#tbl-org-searched').empty();
      //Get the searched organization ID based on name matched with the all organization data
      var searchedOrgID = _.chain(organizations)
      .filter(function(org){
        return org.name == inputOrgName;
      })
      .pluck('id')
      .first()
      .value();
      //add the searched organization marker layer to the map
      layerSearchedOrg = _.chain(organizations)
      .filter(function(org){
        return org.id == searchedOrgID;
      })
      .map(function(org){
        mapAllOrgs.setView([org.latitude, org.longitude], 11)
        return org.marker.addTo(mapAllOrgs);
      })
      .value()
      //Look for the hidden organization table row with the searched organization ID
      //Clone it and append it to the organization information table on the sidebar
      //It has the link to take the user to the individual organization page
      $("#tbl-allorg #row-"+searchedOrgID).clone().appendTo('#tbl-org-searched');
    })

    //Add back all organizations to the map
    $('#btn-org-clear').on('click',function(){
      //Clear the organization information table from the sidebar
      $('#tbl-org-searched').empty();
      //Clear the searched organization layer from the map
      if(layerSearchedOrg || layerAllOrgs){
        _.each(layerSearchedOrg, function(eachLayer){
          mapAllOrgs.removeLayer(eachLayer);
        });
        layerSearchedOrg = [];

        _.each(layerAllOrgs, function(eachLayer){
          mapAllOrgs.removeLayer(eachLayer);
        });
        layerAllOrgs = [];
      }
      //Clear the search box input
      $('#searchbox-org-name').val('');
      //Add back all organizations to the map
      layerAllOrgs = _.map(dataAllOrgs, function(organization) { return organization.marker.addTo(mapAllOrgs); });
      mapAllOrgs.setView([34.0522, -118.2437], 9);
    });
  }
});
