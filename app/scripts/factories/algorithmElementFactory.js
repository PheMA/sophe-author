'use strict';
/* globals endConnector, updateActiveLineLocation, startConnector, clearSelections, selectObject, changeConnectorEndpoints, addOutlineStyles, updateStrokeWidth, Kinetic */

angular.module('sophe.factories.algorithmElement', [])
  .factory('algorithmElementFactory', function() {
    function addConnectionHandler(kineticObj, scope) {
      var stage = scope.canvasDetails.kineticStageObj;
      kineticObj.on('mouseup', function (e) {
        endConnector(stage, e.target);
      });
      kineticObj.on('mousemove', function(evt) {
        updateActiveLineLocation(stage, evt);
      });
      kineticObj.on('mousedown', function (e) {
        endConnector(stage, undefined);  // Make sure it's not carrying over from before
        startConnector(stage, e.target);
      });
    }

    function addStandardEventHandlers(kineticObj, scope) {
      var stage = scope.canvasDetails.kineticStageObj;
      kineticObj.on('mousemove', function(evt) {
        updateActiveLineLocation(stage, evt);
      });
      kineticObj.on('mouseup', function() {
        endConnector(stage, undefined);
        clearSelections(stage);
        selectObject(stage, kineticObj);
      });

      // When we are dragging, move the drag object to be the top element, clear all
      // other selections, and then visually select the dragging element.
      kineticObj.on('dragstart', function() {
        kineticObj.setZIndex(999);
        clearSelections(stage);
        selectObject(stage, kineticObj);
        kineticObj.draw();
      });

      setDraggable(kineticObj, scope);
    }

    function addCursorStyles(kineticObj, scope) {
      // add cursor styling
      kineticObj.on('mouseover', function () {
          document.body.style.cursor = 'pointer';
      });
      kineticObj.on('mouseout', function () {
          document.body.style.cursor = 'default';
          scope.$emit('CANVAS-MOUSEOUT');
      });
    }

    // Sets up a Kinetic shape to be a droppable target
    function setDroppable(kineticObj) {
      kineticObj.droppable = true;
    }

    // Adds appropriate event handlers to a draggable object.
    // Idea for temp layer so we can use getIntersection courtesy of: http://jsbin.com/pecor/3/edit?html,js,output
    function setDraggable(kineticObj, scope) {
      var stage = scope.canvasDetails.kineticStageObj;
      var highlightedDrop = null;

      var dragItem = kineticObj;
      if ('Group' !== kineticObj.nodeType) {
        dragItem = kineticObj.getParent();
      }

      dragItem.on('dragstart',function(){
        dragItem.moveTo(stage.tempLayer);
        Kinetic.DD.isDragging = false;
        stage.mainLayer.draw();
        Kinetic.DD.isDragging = true;
        var dd = Kinetic.DD;
        dd.anim.stop();
        dd.anim.setLayers(stage.tempLayer);
        dd.anim.start();
      });

      dragItem.on('dragmove',function(){
        var pos = stage.getPointerPosition();
        var shape = stage.mainLayer.getIntersection(pos);
        if (!shape) {
          // If we don't have a spot to drop, but we did before, clean up the old shape so it's not
          // still highlighted as an active drop target.
          if (highlightedDrop) {
            updateStrokeWidth(highlightedDrop, true);
            highlightedDrop.getParent().draw();
            highlightedDrop = null;
          }
          return;
        }

        // If we land on a Text element, we need to look for the underlying droppable Rect that should
        // be considered the actual drop target.  We always use a Rect because our visual indicator of
        // a drop target is to modify the Rect itself.
        if (shape.className === 'Text') {
          var allShapes = shape.getParent().getAllIntersections(pos);
          var index = 0;
          for (index = 0; index < allShapes.length; index++) {
            if (allShapes[index].droppable) {
              shape = allShapes[index];
              break;
            }
          }
        }

        if (shape.droppable && shape !== highlightedDrop) {
          if (highlightedDrop) {
            updateStrokeWidth(highlightedDrop, true);
          }
          highlightedDrop = shape;
          updateStrokeWidth(shape, false);
          highlightedDrop.getParent().draw();
        }
      });

      dragItem.on('dragend',function(){
        dragItem.moveTo(stage.mainLayer);
        if (highlightedDrop) {
          updateStrokeWidth(highlightedDrop, true);
          highlightedDrop = null;
          stage.mainLayer.draw();
        }
      });
    }

    function createText(options, group) {
      if ('undefined' === typeof options.text || '' === options.text) {
        options.text = 'New Item';
      }

      var kineticObj = new Kinetic.Text(options);
      group.add(kineticObj);
      return kineticObj;
    }

    function createRectangle(options, group) {
      var kineticObj = new Kinetic.Rect(options);
      group.add(kineticObj);
      kineticObj.originalStrokeWidth = options.strokeWidth;
      return kineticObj;
    }

    function createCircle(options, group) {
      var kineticObj = new Kinetic.Circle(options);
      group.add(kineticObj);
      kineticObj.originalStrokeWidth = options.strokeWidth;
      return kineticObj;
    }

    function updateConnectedLines(connector, stage) {
      var i = 0;
      for (i = connector.connections.length - 1; i >= 0; i--) {
        var line = connector.connections[i];
        var startPos = {};
        var endPos = {};
        if (line.connectors.start === connector) {
          line.setAbsolutePosition(connector.getAbsolutePosition());
        }

        startPos = {x: line.getPoints()[0], y: line.getPoints()[1]};
        endPos = {
          x: line.connectors.end.getAbsolutePosition().x - line.connectors.start.getAbsolutePosition().x,
          y: line.connectors.end.getAbsolutePosition().y - line.connectors.start.getAbsolutePosition().y,
        };
        changeConnectorEndpoints(stage, line, startPos, endPos);
      }
    }

    function createQDMDataElement(config, scope) {
      var options = {
          x: ((config && config.x) ? config.x : 50), y: ((config && config.y) ? config.y : 50),
          width: 175, height: 200,
          fill: '#dbeef4', name: 'mainRect',
          stroke: 'black', strokeWidth: 1
      };

      var group = new Kinetic.Group({draggable: true});
      addStandardEventHandlers(group, scope);
      addCursorStyles(group, scope);

      var workflowObj = createRectangle(options, group);
      group.on('dragmove', function(e) {
        // e.target is assumed to be a Group
        if (e.target.nodeType !== 'Group') {
          console.error('Unsupported object' + e.target);
          return;
        }

        // For the element we are moving, redraw all connection lines
        var stage = group.getStage();
        updateConnectedLines(e.target.find('.rightConnector')[0], stage);
        updateConnectedLines(e.target.find('.leftConnector')[0], stage);
        stage.draw();
      });

      var headerOptions = {
          x: options.x, y: options.y,
          width: options.width, // Leave out height so it auto-sizes
          fontFamily: 'Calibri', fontSize: 14, fill: 'black',
          text: config.element.name,
          align: 'center', padding: 5
      };
      var headerObj = createText(headerOptions, group);

      var termDropOptions = {
        x: options.x + 10, y: headerObj.height() + headerOptions.y + 5,
        width: options.width - 20, height: 75,
        fill: '#EEEEEE',
        stroke: '#CCCCCC', strokeWidth: 1
      };
      var termObj = createRectangle(termDropOptions, group);
      setDroppable(termObj);

      var termTextOptions = {
        x: termDropOptions.x, y: termDropOptions.y,
        width: termObj.width(), height: termObj.height(),
        fontFamily: 'Calibri', fontSize: 14, fill: 'gray',
        text: 'Drag and drop clinical terms or value sets here, or search for terms',
        align: 'center', padding: 5
      };
      createText(termTextOptions, group);

      var configOptions = {
        x: termDropOptions.x, y: termObj.height() + termDropOptions.y + 5,
        width: termDropOptions.width, height: termDropOptions.height,
        fill: '#EEEEEE',
        stroke: '#CCCCCC', strokeWidth: 1
      };
      var configObj = createRectangle(configOptions, group);
      setDroppable(configObj);

      // Resize the main container to ensure consistent spacing regardless of the
      // height of internal components.
      workflowObj.setHeight(configObj.getY() + configObj.getHeight() - options.y + 10);

      var leftConnectOptions = {
        x: options.x, y: options.y + (workflowObj.getHeight() / 2),
        width: 15, height: 15,
        fill: 'white', name: 'leftConnector',
        stroke: 'black', strokeWidth: 1
      };
      var leftObj = createCircle(leftConnectOptions, group);
      addOutlineStyles(leftObj);
      addConnectionHandler(leftObj, scope);
      leftObj.connections = [];

      var rightConnectOptions = {
        x: options.x + options.width, y: options.y + (workflowObj.getHeight() / 2),
        width: 15, height: 15,
        fill: 'white', name: 'rightConnector',
        stroke: 'black', strokeWidth: 1
      };
      var rightObj = createCircle(rightConnectOptions, group);
      addOutlineStyles(rightObj);
      addConnectionHandler(rightObj, scope);
      rightObj.connections = [];

      var mainLayer = scope.canvasDetails.kineticStageObj.find('#mainLayer');
      mainLayer.add(group);
      mainLayer.draw();

      return workflowObj;
    }

    function createQDMTemporalOperator(config, scope) {
      var group = new Kinetic.Group({draggable: true});
      var spacing = 75;
      addStandardEventHandlers(group, scope);
      addCursorStyles(group, scope);

      var options = {
          x: ((config && config.x) ? config.x : 50), y: ((config && config.y) ? config.y : 50),
          width: 175, height: 175,
          fill: 'white', name: 'eventA',
          stroke: 'gray', strokeWidth: 1
      };
      var eventA = createRectangle(options, group);
      eventA.dash([10, 5]);
      eventA.dashEnabled(true);
      setDroppable(eventA);

      var headerOptions = {
          x: options.x, y: options.y,
          width: options.width, // Leave out height so it auto-sizes
          fontFamily: 'Calibri', fontSize: 18, fill: 'black',
          text: 'Event A',
          align: 'center', padding: 5
      };
      var eventAText = createText(headerOptions, group);
      createText({
        x: eventAText.getX(), y: eventAText.getY() + eventAText.getHeight() + 25,
        width: options.width, // Leave out height so it auto-sizes
        fontFamily: 'Calibri', fontSize: 14, fill: 'black',
        text: '(Drag and drop a data element here to define the event)',
        align: 'center', padding: 5}, group);

      options.x = options.x + options.width + spacing;
      var eventB = createRectangle(options, group);
      eventB.dash([10, 5]);
      eventB.dashEnabled(true);
      setDroppable(eventB);

      headerOptions.x = options.x;
      headerOptions.y = options.y;
      headerOptions.text = 'Event B';
      var eventBText = createText(headerOptions, group);
      createText({
        x: eventBText.getX(), y: eventBText.getY() + eventBText.getHeight() + 25,
        width: options.width, // Leave out height so it auto-sizes
        fontFamily: 'Calibri', fontSize: 14, fill: 'black',
        text: '(Drag and drop a data element here to define the event)',
        align: 'center', padding: 5}, group);

      var stage = scope.canvasDetails.kineticStageObj;
      var line = new Kinetic.Line({
        x: eventA.getX() + eventA.getWidth(),
        y: eventA.getY() + eventA.getHeight() / 2,
        points: [0, 0],
        stroke: 'black', strokeWidth: 2
      });
      group.add(line);
      changeConnectorEndpoints(stage, line, {x: 0, y: 0}, {x: spacing, y: 0});

      var mainLayer = stage.find('#mainLayer');
      mainLayer.add(group);
      mainLayer.draw();
      return group;
    }

    function createQDMLogicalOperator(config, scope) {
      var options = {
          x: ((config && config.x) ? config.x : 50), y: ((config && config.y) ? config.y : 50),
          width: 200, height: 200,
          fill: '#eeeeee', name: 'mainRect',
          stroke: 'gray', strokeWidth: 1
      };

      var group = new Kinetic.Group({draggable: true});
      addStandardEventHandlers(group, scope);
      addCursorStyles(group, scope);

      var workflowObj = createRectangle(options, group);
      workflowObj.dash([10, 5]);
      workflowObj.dashEnabled(true);
      setDroppable(workflowObj);

      var headerOptions = {
          x: options.x, y: options.y,
          width: options.width, // Leave out height so it auto-sizes
          fontFamily: 'Calibri', fontSize: 14, fill: 'black',
          text: config.element.name,
          align: 'center', padding: 5
      };
      createText(headerOptions, group);

      var mainLayer = scope.canvasDetails.kineticStageObj.find('#mainLayer');
      mainLayer.add(group);
      mainLayer.draw();
      return group;
    }

    function createGenericElement(config, scope) {
      var options = {
          x: ((config && config.x) ? config.x : 50), y: ((config && config.y) ? config.y : 50),
          width: 175, height: 100,
          fill: '#dbeef4', name: 'mainRect',
          stroke: 'black', strokeWidth: 1
      };

      var group = new Kinetic.Group({draggable: true});
      addStandardEventHandlers(group, scope);
      addCursorStyles(group, scope);
      var workflowObj = createRectangle(options, group);

      var headerOptions = {
          x: options.x, y: options.y,
          width: options.width, // Leave out height so it auto-sizes
          fontFamily: 'Calibri', fontSize: 14, fill: 'black',
          text: config.element.name,
          align: 'center', padding: 5
      };
      var headerObj = createText(headerOptions, group);

      workflowObj.setHeight(headerObj.getHeight() + 10);

      var mainLayer = scope.canvasDetails.kineticStageObj.find('#mainLayer');
      mainLayer.add(group);
      mainLayer.draw();
      return group;
    }

    var factory = {};
    factory.addWorkflowObject = function (config, scope) {
      // If there is no canvas to add to, we are done here
      if('undefined' === typeof scope.canvasDetails) {
          return null;
      }

      if (!config.element) {
        console.error('No element definition was provided');
        return null;
      }

      var workflowObject = null;
      if (config.element.type === 'TemporalOperator') {
        workflowObject = createQDMTemporalOperator(config, scope);
      }
      else if (config.element.type === 'DataElement' || config.element.type === 'Category') {
        workflowObject = createQDMDataElement(config, scope);
      }
      else if (config.element.type === 'LogicalOperator') {
        workflowObject = createQDMLogicalOperator(config, scope);
      }
      else {
        workflowObject = createGenericElement(config, scope);
      }

      return workflowObject;
    };
    return factory;
});