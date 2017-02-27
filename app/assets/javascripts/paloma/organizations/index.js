$(document).ready(function(){
  //Hide the organization listing table with links to show page
  $('#tbl-allorg').hide();
  $('#tbl-org-type-switch').hide();
  $('#tbl-org-size-switch').hide();
  $('#btn-org-clear').hide();
  $('[data-toggle="tooltip"]').tooltip()
  Paloma.start();
});

var getNames = function(data){
  return _.pluck(data, 'name');
};

//Return the fill color of a circle marker based on organization type
var setCircleMarkerColor = function(orgType, fillArea){
  switch(orgType) {
    case "Broadcasters, Producers, TV, Film & Digital Media":
      return fillArea === 'fill' ? '#ffc100' : '#cc9a00';
      break;
    case "Performing Arts":
      return fillArea === 'fill' ? '#e94b6e' : '#e31e49';
      break;
    case "Support & Advocacy":
      return fillArea === 'fill' ? '#ff934f' : '#ff741c';
      break;
    case "Museums, Visual Arts, History":
      return fillArea === 'fill' ? '#2a9aec' : '#1380d0';
      break;
    case "Community":
      return fillArea === 'fill' ? '#228557' : '#185c3c';
      break;
    case "Education":
      return fillArea === 'fill' ? '#572285' : '#3c185c';
      break;
    default:
      return 'black';
  }
};

//Return the radius of the circle marker based on organization size
var setCircleMarkerRadius = function(orgSize){
  switch(orgSize) {
    case "Very Small":
      return 5;
      break;
    case "Small":
      return 10;
      break;
    case "Medium":
      return 15;
      break;
    case "Large":
      return 20;
      break;
    case "Very Large":
      return 25;
      break;
    default:
      return 0;
  }
};

var makeMakers = function(organizations, layer){
  return  _.chain(organizations)
           .filter(function(organization){
             return organization.latitude != null;
           })
           .map(function(organization) {
             organization.marker = L.circleMarker([organization.latitude, organization.longitude],
                                     {
                                       'weight': 2,
                                       'opacity': 0.8,
                                       'color': setCircleMarkerColor(organization.org_type, 'stroke'),
                                       'fillColor': setCircleMarkerColor(organization.org_type, 'fill'),
                                       'fillOpacity': 0.5,
                                       'radius': setCircleMarkerRadius(organization.size)
                                     })
                                    .bindPopup(organization.name)
                                    .on('click', function() {
                                      layer.setView([organization.latitude, organization.longitude], 11);
                                      $('#tbl-org-searched').empty();
                                      $("#tbl-allorg #row-"+organization.id).clone().appendTo('#tbl-org-searched');
                                    });
               organization.size_num = setCircleMarkerRadius(organization.size);
             return organization;
           })
           .value();
}

var plotMarkers = function(data, layer){
  return _.map(data, function(datum) { return datum.marker.addTo(layer); });
}

var cleanMarkers = function(markerLayer, layer){
  if(markerLayer){ _.each(markerLayer, function(eachLayer){ layer.removeLayer(eachLayer); }); }
}

var groupData = function(data, field){
  return _.groupBy( data, function(datum){ return datum[field] } );
}

var autoComplete = function(names){
  $( "#searchbox-org-name" ).autocomplete({
    source: names,
    minLength: 2,
    delay: 500
  });
}

var addSearchInputTooltip = function(){
  //Add search input tooltip
  $("#div-searchbox").attr({
    'data-toggle': "tooltip",
    'data-placement': "bottom"
  });
  $("#div-searchbox").tooltip({
    'trigger': 'click',
    'html': true,
    'title': 'To enable search: <br>Switch on box switches;<br>Or switch off round switches'
  })
}

var addSwitchTooltip = function(){
  $("#div-switches").attr({
    'data-toggle': "tooltip",
    'data-placement': 'top'
  });
  $("#div-switches").tooltip({
    'trigger': 'click',
    'title': 'To enable switches: clear search.'
  })
}

var destroySwitchTooltip = function(){
  $("#div-switches").tooltip('destroy');
}

var destroySearchInputTooltip = function(){
  $("#div-searchbox").tooltip('destroy');
}

var heatIntensity = function(size){
  switch (size) {
    case 5:
      return 0.2;
      break;
    case 10:
      return 0.4;
      break;
    case 15:
      return 0.6;
    case 20:
      return 0.8;
      break;
    case 25:
      return 1;
      break;
    default:
      break;
  }
}


Paloma.controller('Organizations', {
  index: function(){

    //----------------------------------------------------------------------------
    //All organizations and their information acquired from the controller
    //----------------------------------------------------------------------------
    var organizations = this.params.organizations;

    //----------------------------------------------------------------------------
    //The layer that stores anything that is currently mapped
    //----------------------------------------------------------------------------
    var layerMarkerMapped = [];

    //----------------------------------------------------------------------------
    //Load the basemap
    //----------------------------------------------------------------------------
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

    //----------------------------------------------------------------------------
    //Make markers for all organization
    //----------------------------------------------------------------------------
    var dataAllOrgs = makeMakers(organizations, mapAllOrgs);

    //----------------------------------------------------------------------------
    //All organization names
    //----------------------------------------------------------------------------
    var orgNames = getNames(organizations);
    autoComplete(orgNames);

    //----------------------------------------------------------------------------
    // Organizations are grouped by size
    //----------------------------------------------------------------------------
    var dataGroupedSizeAllOrgs = groupData(dataAllOrgs, 'size_num');

    //----------------------------------------------------------------------------
    // Organizations are grouped by type
    //----------------------------------------------------------------------------
    var dataGroupedTypeAllOrgs = groupData(dataAllOrgs, 'org_type');

    //----------------------------------------------------------------------------
    //On page load, plot all markers
    //----------------------------------------------------------------------------
    layerMarkerMapped = _.chain(dataAllOrgs)
                         .sortBy(function(datum){
                           return -datum.size_num;
                         })
                         .map(function(datum){
                           return datum.marker.addTo(mapAllOrgs);
                         })
                         .value();

    //----------------------------------------------------------------------------
    //The coordinates and intensity for the heat map
    //----------------------------------------------------------------------------
    var arrayLatLng;

    //----------------------------------------------------------------------------
    //The layer for the heatmap
    //----------------------------------------------------------------------------
    var layerHeat = [];

    //----------------------------------------------------------------------------
    // When the display option switches are changed,
    // show different type or size switches.
    // When one switch is turned on,
    // the other one should be turned off automatically,
    // the turned-off switch's child switches should be turned off as well,
    // the map markers should be cleared,
    // the auto-complete should be set to empty since there is no marker
    // and the corresponding options should show.
    // When one switch is turned off manually,
    // the child switches should be hidden and switched off
    // all markers should be shown again
    // and the orgNames should be all organizations' names
    //----------------------------------------------------------------------------
    $('#tbl-switch input').on('change', function(){
      // the id of the switch display option
      var id = this.id;
      // the status of the switch display option
      var status = $(this).prop('checked');

      if(id === 'swith-type'){
        //clear all existing makers on the map
        cleanMarkers(layerMarkerMapped, mapAllOrgs);
        layerMarkerMapped = [];
        //uncheck the heat map checkbox
        $('#ckbox-heatmap').prop('checked', false);
        //if the round type switch is on
        if(status === true){
          //clean the heat map layer
          cleanMarkers(layerHeat, mapAllOrgs);
          layerHeat=[];
          arrayLatLng = [];
          //hide the heatmap switch
          $('#tbl-heatmap').hide();
          //Disable the seach input
          $('#form-org-search input').attr('disabled', true);
          addSearchInputTooltip();
          //Show the type switches
          $('#tbl-org-type-switch').show();
          //Hide the size switches
          $('#tbl-org-size-switch').hide();
          //Uncheck the size switches
          $('#swith-size').prop('checked', false);
          $('#tbl-org-size-switch input').prop('checked', false);
          //No names to show for autoComplete
          orgNames = [];
          autoComplete(orgNames);
        }else{//if the type switches is turned off
          //enable the search form
          $('#form-org-search input').attr('disabled', false);
          //hide the round type switch children switches
          $('#tbl-org-type-switch').hide();
          destroySearchInputTooltip();
          //show the heatmap switch
          $('#tbl-heatmap').show();
          //add back all organizations
          layerMarkerMapped = _.chain(dataAllOrgs)
                               .sortBy(function(datum){
                                 return -datum.size_num;
                               })
                               .map(function(datum){
                                 return datum.marker.addTo(mapAllOrgs);
                               })
                               .value();
          //all organization names to populate the autocomplete
          orgNames = getNames(organizations);
          autoComplete(orgNames);
          //turn off all type child switches
          $('#tbl-org-type-switch input').prop('checked', false);
        }

      }else if(id === 'swith-size'){
        //clean whatever is on the map
        cleanMarkers(layerMarkerMapped, mapAllOrgs);
        layerMarkerMapped = []
        //uncheck the heat map checkbox
        $('#ckbox-heatmap').prop('checked', false);
        //if the size switch is on
        if(status === true){
          //clean the heat map layer
          cleanMarkers(layerHeat, mapAllOrgs);
          layerHeat=[];
          arrayLatLng = [];
          //hide the heatmap switch
          $('#tbl-heatmap').hide();
          //add the search tooltip
          addSearchInputTooltip();
          //disable the seach feature
          $('#form-org-search input').attr('disabled', true);
          //hide the type child switches
          $('#tbl-org-type-switch').hide();
          //show the size child switches
          $('#tbl-org-size-switch').show();
          //uncheck the type switch
          $('#swith-type').prop('checked', false);
          //empty the organizations names for the autoComplete
          orgNames = [];
          autoComplete(orgNames);
          //uncheck all type child switches
          $('#tbl-org-type-switch input').prop('checked', false);
        }else{
          //disable the tooltip for searching
          destroySearchInputTooltip();
          //show the heatmap switch
          $('#tbl-heatmap').show();
          //enable the seach feature
          $('#form-org-search input').attr('disabled', false);
          //hide all size child switches
          $('#tbl-org-size-switch').hide();
          //add back all organizations to the map
          layerMarkerMapped = _.chain(dataAllOrgs)
                               .sortBy(function(datum){
                                 return -datum.size_num;
                               })
                               .map(function(datum){
                                 return datum.marker.addTo(mapAllOrgs);
                               })
                               .value();
          //add back all organizations names to the autoComplete
          orgNames = getNames(organizations);
          autoComplete(orgNames);
          //uncheck all the size child switches
          $('#tbl-org-size-switch input').prop('checked', false);
        }
      }
    })

    //----------------------------------------------------------------------------
    // When any type switch is on,
    // add such type markers to the map,
    // obtain names of these organizations of this type,
    // and change the auto-complte.
    // When any type switch is off,
    // clean such type markers from the map,
    // clear such names from the orgNames,
    // and change the autoComplete.
    //----------------------------------------------------------------------------
    $('#tbl-org-type-switch input').on('change', function(){
      //id of the changed type child switch
      var id = this.id;
      //status of the changed type child switch
      var status = $(this).prop('checked');

      //enable the search feature
      $('#form-org-search input').attr('disabled', false);

      //if one of the type child switches is on
      if(status){
        //destroy the tooltip on the search area
        destroySearchInputTooltip();

        switch(id){
          case 'swith-edu':
            //plot all markers of this type onto the map, store the layer
            layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedTypeAllOrgs['Education'], mapAllOrgs)), true);
            //use all names of this type organizations to populate the autoComplete
            orgNames = _.union(orgNames, getNames(dataGroupedTypeAllOrgs['Education']));
            autoComplete(orgNames);
            break;
          case 'swith-com':
            layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedTypeAllOrgs['Community'], mapAllOrgs)), true);
            orgNames = _.union(orgNames, getNames(dataGroupedTypeAllOrgs['Community']));
            autoComplete(orgNames);
            break;
          case 'swith-per':
            layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedTypeAllOrgs['Performing Arts'], mapAllOrgs)), true);
            orgNames = _.union(orgNames, getNames(dataGroupedTypeAllOrgs['Performing Arts']));
            autoComplete(orgNames);
            break;
          case 'swith-sup':
            layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedTypeAllOrgs['Support & Advocacy'], mapAllOrgs)), true);
            orgNames = _.union(orgNames, getNames(dataGroupedTypeAllOrgs['Support & Advocacy']));
            autoComplete(orgNames);
            break;
          case 'swith-mus':
            layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedTypeAllOrgs['Museums, Visual Arts, History'], mapAllOrgs)), true);
            orgNames = _.union(orgNames, getNames(dataGroupedTypeAllOrgs['Museums, Visual Arts, History']));
            autoComplete(orgNames);
            break;
          case 'swith-bro':
            layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedTypeAllOrgs['Broadcasters, Producers, TV, Film & Digital Media'], mapAllOrgs)), true);
            orgNames = _.union(orgNames, getNames(dataGroupedTypeAllOrgs['Broadcasters, Producers, TV, Film & Digital Media']));
            autoComplete(orgNames);
            break;
          default:
            break;
        }
      }else{
        //to see if there is any on switches of the type child
        var checkedIds = [];
        $("#tbl-org-type-switch input:checkbox").each(function(){
          var $this = $(this);
          if($this.is(":checked")){
            checkedIds.push($this.attr("id"));
          }
        });
        //if none of the type switch is on, disable the search feature and add tooltip
        if(checkedIds.length === 0){
          addSearchInputTooltip();
          $('#form-org-search input').attr('disabled', true);
        }

        //store the markers to be removed based on which type child switch is turned off
        var makersToRemove = [];
        switch(id){
          case 'swith-edu':
            //store the markers of a type that is switched off from the mapped markers
            makersToRemove = _.filter(layerMarkerMapped, function(datum){return datum.options.fillColor === '#572285';});
            //clean these markers
            cleanMarkers(makersToRemove, mapAllOrgs);
            //update the mapped layer
            layerMarkerMapped = _.difference(layerMarkerMapped, makersToRemove);
            //update the organizations name for the autoComplete
            orgNames = _.difference(orgNames, getNames(dataGroupedTypeAllOrgs['Education']));
            autoComplete(orgNames);
            break;
          case 'swith-com':
            makersToRemove = _.filter(layerMarkerMapped, function(datum){return datum.options.fillColor === '#228557';});
            cleanMarkers(makersToRemove, mapAllOrgs);
            layerMarkerMapped = _.difference(layerMarkerMapped, makersToRemove);
            orgNames = _.difference(orgNames, getNames(dataGroupedTypeAllOrgs['Community']));
            autoComplete(orgNames);
            break;
          case 'swith-per':
            makersToRemove = _.filter(layerMarkerMapped, function(datum){return datum.options.fillColor === '#e94b6e';});
            cleanMarkers(makersToRemove, mapAllOrgs);
            layerMarkerMapped = _.difference(layerMarkerMapped, makersToRemove);
            orgNames = _.difference(orgNames, getNames(dataGroupedTypeAllOrgs['Performing Arts']));
            autoComplete(orgNames);
            break;
          case 'swith-sup':
            makersToRemove = _.filter(layerMarkerMapped, function(datum){return datum.options.fillColor === '#ff934f';});
            cleanMarkers(makersToRemove, mapAllOrgs);
            layerMarkerMapped = _.difference(layerMarkerMapped, makersToRemove);
            orgNames = _.difference(orgNames, getNames(dataGroupedTypeAllOrgs['Support & Advocacy']));
            autoComplete(orgNames);
            break;
          case 'swith-mus':
            makersToRemove = _.filter(layerMarkerMapped, function(datum){return datum.options.fillColor === '#2a9aec';});
            cleanMarkers(makersToRemove, mapAllOrgs);
            layerMarkerMapped = _.difference(layerMarkerMapped, makersToRemove);
            orgNames = _.difference(orgNames, getNames(dataGroupedTypeAllOrgs['Museums, Visual Arts, History']));
            autoComplete(orgNames);
            break;
          case 'swith-bro':
            makersToRemove = _.filter(layerMarkerMapped, function(datum){return datum.options.fillColor === '#ffc100';});
            cleanMarkers(makersToRemove, mapAllOrgs);
            layerMarkerMapped = _.difference(layerMarkerMapped, makersToRemove);
            orgNames = _.difference(orgNames, getNames(dataGroupedTypeAllOrgs['Broadcasters, Producers, TV, Film & Digital Media']));
            autoComplete(orgNames);
            break;
          default:
            break;
        }
      }
    });

    //----------------------------------------------------------------------------
    // When any size switch is on,
    // add such size markers to the map,
    // obtain names of these organizations of this size,
    // and change the auto-complte.
    // When any size switch is off,
    // clean such size markers from the map,
    // clear such names from the orgNames,
    // and change the autoComplete.
    //----------------------------------------------------------------------------
    $('#tbl-org-size-switch input').on('change', function(){
      var id = this.id;
      var status = $(this).prop('checked');

      $('#form-org-search input').attr('disabled', false);

      if(status){
        //destroy the tooltip on the search area
        destroySearchInputTooltip();
        switch(id){
          case 'swith-vs':
            //if one size of organizations switch is on, add these markers to the map and to the layer
            layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedSizeAllOrgs['5'], mapAllOrgs)), true);
            //add these organizations names to the autoComplete
            orgNames = _.union(orgNames, getNames(dataGroupedSizeAllOrgs['5']));
            autoComplete(orgNames);
            break;
          case 'swith-sm':
            layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedSizeAllOrgs['10'], mapAllOrgs)), true);
            orgNames = _.union(orgNames, getNames(dataGroupedSizeAllOrgs['10']));
            autoComplete(orgNames);
            break;
          case 'swith-m':
            layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedSizeAllOrgs['15'], mapAllOrgs)), true);
            orgNames = _.union(orgNames, getNames(dataGroupedSizeAllOrgs['15']));
            autoComplete(orgNames);
            break;
          case 'swith-l':
            layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedSizeAllOrgs['20'], mapAllOrgs)), true);
            orgNames = _.union(orgNames, getNames(dataGroupedSizeAllOrgs['20']));
            autoComplete(orgNames);
            break;
          case 'swith-vl':
            layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedSizeAllOrgs['25'], mapAllOrgs)), true);
            orgNames = _.union(orgNames, getNames(dataGroupedSizeAllOrgs['25']));
            autoComplete(orgNames);
            break;
          default:
            break;
        }
      }else{
        //to see if there is any size child switch is on
        var checkedIds = [];
        $("#tbl-org-type-switch input:checkbox").each(function(){
          var $this = $(this);
          if($this.is(":checked")){
            checkedIds.push($this.attr("id"));
          }
        });
        //if nothing is on, ban the search feature
        if(checkedIds.length === 0){
          addSearchInputTooltip();
          $('#form-org-search input').attr('disabled', true);
        }

        var makersToRemove = [];
        switch(id){
          case 'swith-vs':
            //if one of the size child switche is turned off, find thesw markers out from the layer
            makersToRemove = _.filter(layerMarkerMapped, function(datum){return datum.options.radius === 5;});
            //clean these markers
            cleanMarkers(makersToRemove, mapAllOrgs);
            //update the mapped marker layer
            layerMarkerMapped = _.difference(layerMarkerMapped, makersToRemove);
            //update the organizations names for the autoComplete
            orgNames = _.difference(orgNames, getNames(dataGroupedSizeAllOrgs['5']));
            autoComplete(orgNames);
            break;
          case 'swith-sm':
            makersToRemove = _.filter(layerMarkerMapped, function(datum){return datum.options.radius === 10;});
            cleanMarkers(makersToRemove, mapAllOrgs);
            layerMarkerMapped = _.difference(layerMarkerMapped, makersToRemove);
            orgNames = _.difference(orgNames, getNames(dataGroupedSizeAllOrgs['10']));
            autoComplete(orgNames);
            break;
          case 'swith-m':
            makersToRemove = _.filter(layerMarkerMapped, function(datum){return datum.options.radius === 15;});
            cleanMarkers(makersToRemove, mapAllOrgs);
            layerMarkerMapped = _.difference(layerMarkerMapped, makersToRemove);
            orgNames = _.difference(orgNames, getNames(dataGroupedSizeAllOrgs['15']));
            autoComplete(orgNames);
            break;
          case 'swith-l':
            makersToRemove = _.filter(layerMarkerMapped, function(datum){return datum.options.radius === 20;});
            cleanMarkers(makersToRemove, mapAllOrgs);
            layerMarkerMapped = _.difference(layerMarkerMapped, makersToRemove);
            orgNames = _.difference(orgNames, getNames(dataGroupedSizeAllOrgs['20']));
            autoComplete(orgNames);
            break;
          case 'swith-vl':
            makersToRemove = _.filter(layerMarkerMapped, function(datum){return datum.options.radius === 25;});
            cleanMarkers(makersToRemove, mapAllOrgs);
            layerMarkerMapped = _.difference(layerMarkerMapped, makersToRemove);
            orgNames = _.difference(orgNames, getNames(dataGroupedSizeAllOrgs['25']));
            autoComplete(orgNames);
            break;
          default:
            break;
      }
    }
  });

    //----------------------------------------------------------------------------
    //The search button function
    //----------------------------------------------------------------------------
    $('#btn-org-search').on('click',function(){
      //clean the heat map layer
      cleanMarkers(layerHeat, mapAllOrgs);
      layerHeat=[];
      arrayLatLng = [];
      //hide the heatmap switch
      $('#tbl-heatmap').hide();
      //Disable all checkboxes
      $('.sidebar-all-orgs input[type=checkbox]').attr('disabled',true);
      addSwitchTooltip();
      //Get the input organization name
      var inputOrgName = $( "#searchbox-org-name" ).val();
      //Show the clear button
      $('#btn-org-clear').show();
      //clear the all organizations and the searched organization marker layer
      cleanMarkers(layerMarkerMapped, mapAllOrgs);
      layerMarkerMapped = [];
      //clear the organization information table on the sidebar
      $('#tbl-org-searched').empty();
      //clean the heat map layer
      cleanMarkers(layerHeat, mapAllOrgs);
      layerHeat=[];
      arrayLatLng = [];
      //uncheck the heat map checkbox
      $('#ckbox-heatmap').prop('checked', false);
      //Get the searched organization ID based on name matched with the all organization data
      var searchedOrgID = _.chain(organizations)
                          .filter(function(org){
                            return org.name == inputOrgName;
                          })
                          .pluck('id')
                          .first()
                          .value();

      //add the searched organization marker layer to the map
      layerMarkerMapped = _.chain(organizations)
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

    //----------------------------------------------------------------------------
    //Add back organizations to the map
    //----------------------------------------------------------------------------
    $('#btn-org-clear').on('click',function(){
      //clean the heat map layer
      cleanMarkers(layerHeat, mapAllOrgs);
      layerHeat=[];
      arrayLatLng = [];
      //show the heatmap switch
      $('#tbl-heatmap').show();
      destroySwitchTooltip();
      //Clear the organization information table from the sidebar
      $('#tbl-org-searched').empty();

      //Enable all checkboxes
      $('.sidebar-all-orgs input[type=checkbox]').attr('disabled',false);

      //Clear the search box input
      $('#searchbox-org-name').val('');

      //Clear the searched organization layer from the map
      cleanMarkers(layerMarkerMapped, mapAllOrgs);
      layerMarkerMapped = [];

      //clean the heat map layer
      cleanMarkers(layerHeat, mapAllOrgs);
      layerHeat=[];
      arrayLatLng = [];
      //uncheck the heat map checkbox
      $('#ckbox-heatmap').prop('checked', false);

      //Set the map to the original view
      mapAllOrgs.setView([34.0522, -118.2437], 10);

      //Hide the clear button
      $('#btn-org-clear').hide();

      //clean orgNames for the autoComplete
      orgNames = [];

      //if the switch type parent switch is on
      if($('#swith-type').prop('checked')){
        //see which child switches are on
        var checkedIds = [];
        $("#tbl-org-type-switch input:checkbox").each(function(){
          var $this = $(this);
          if($this.is(":checked")){
            checkedIds.push($this.attr("id"));
          }
        });

        //for these checked child switches, add their markers back to the map and names back to the autoComplete
        _.each(checkedIds, function(id){
          switch(id){
            case 'swith-edu':
              layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedTypeAllOrgs['Education'], mapAllOrgs)), true);
              orgNames = _.union(orgNames, getNames(dataGroupedTypeAllOrgs['Education']));
              autoComplete(orgNames);
              break;
            case 'swith-com':
              layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedTypeAllOrgs['Community'], mapAllOrgs)), true);
              orgNames = _.union(orgNames, getNames(dataGroupedTypeAllOrgs['Community']));
              autoComplete(orgNames);
              break;
            case 'swith-per':
              layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedTypeAllOrgs['Performing Arts'], mapAllOrgs)), true);
              orgNames = _.union(orgNames, getNames(dataGroupedTypeAllOrgs['Performing Arts']));
              autoComplete(orgNames);
              break;
            case 'swith-sup':
              layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedTypeAllOrgs['Support & Advocacy'], mapAllOrgs)), true);
              orgNames = _.union(orgNames, getNames(dataGroupedTypeAllOrgs['Support & Advocacy']));
              autoComplete(orgNames);
              break;
            case 'swith-mus':
              layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedTypeAllOrgs['Museums, Visual Arts, History'], mapAllOrgs)), true);
              orgNames = _.union(orgNames, getNames(dataGroupedTypeAllOrgs['Museums, Visual Arts, History']));
              autoComplete(orgNames);
              break;
            case 'swith-bro':
              layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedTypeAllOrgs['Broadcasters, Producers, TV, Film & Digital Media'], mapAllOrgs)), true);
              orgNames = _.union(orgNames, getNames(dataGroupedTypeAllOrgs['Broadcasters, Producers, TV, Film & Digital Media']));
              autoComplete(orgNames);
              break;
            default:
              break;
          }
        });

      }else if($('#swith-size').prop('checked')){//if the parent size switch is on
        //see what child size switches are on
        var checkedIds = [];
        $("#tbl-org-size-switch input:checkbox").each(function(){
          var $this = $(this);
          if($this.is(":checked")){
            checkedIds.push($this.attr("id"));
          }
        });

        //for these child switches who are on, add their markers back to the map and their names back to the autoComplete
        _.each(checkedIds, function(id){
          switch(id){
            case 'swith-vs':
              layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedSizeAllOrgs['5'], mapAllOrgs)), true);
              orgNames = _.union(orgNames, getNames(dataGroupedSizeAllOrgs['5']));
              autoComplete(orgNames);
              break;
            case 'swith-sm':
              layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedSizeAllOrgs['10'], mapAllOrgs)), true);
              orgNames = _.union(orgNames, getNames(dataGroupedSizeAllOrgs['10']));
              autoComplete(orgNames);
              break;
            case 'swith-m':
              layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedSizeAllOrgs['15'], mapAllOrgs)), true);
              orgNames = _.union(orgNames, getNames(dataGroupedSizeAllOrgs['15']));
              autoComplete(orgNames);
              break;
            case 'swith-l':
              layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedSizeAllOrgs['20'], mapAllOrgs)), true);
              orgNames = _.union(orgNames, getNames(dataGroupedSizeAllOrgs['20']));
              autoComplete(orgNames);
              break;
            case 'swith-vl':
              layerMarkerMapped = _.flatten(_.union(layerMarkerMapped, plotMarkers(dataGroupedSizeAllOrgs['25'], mapAllOrgs)), true);
              orgNames = _.union(orgNames, getNames(dataGroupedSizeAllOrgs['25']));
              autoComplete(orgNames);
              break;
            default:
              break;
          }
        })
      }else{
        //if none of the type and size parent switch is on, get all organizations names to the autoComplete
        orgNames = getNames(organizations);
        autoComplete(orgNames);
        //Add back all organizations to the map
        layerMarkerMapped = _.chain(dataAllOrgs)
                             .sortBy(function(datum){
                               return -datum.size_num;
                             })
                             .map(function(datum){
                               return datum.marker.addTo(mapAllOrgs);
                             })
                             .value();
      }
    });

    //----------------------------------------------------------------------------
    //The heat map switch only for all organizations
    //UPDATE THIS FOR OTHER SUBSET OF ORGANIZATIONS LATER
    //----------------------------------------------------------------------------
    $('#ckbox-heatmap').on('change', function(){
      var status = $(this).prop('checked');

      //if the switch is on, map all organizations heat map
      if(status){
        arrayLatLng = _.map(dataAllOrgs, function(datum){
          return [datum.latitude, datum.longitude, heatIntensity(datum.size_num)]
        });

        layerHeat.push(L.heatLayer(arrayLatLng, {
          radius: 30,
          gradient: {
            '0.2': '#1a9641',
            '0.4': '#a6d96a',
            '0.6': '#ffffbf',
            '0.8': '#fdae61',
            '1': '#d7191c'
          },
          minOpacity: 0.5
        }).addTo(mapAllOrgs));

      }else{
        //if the switch is off, clean the heatmap and the data for generating it
        cleanMarkers(layerHeat, mapAllOrgs);
        layerHeat = [];
        arrayLatLng = [];
      }
    })
  }


});
