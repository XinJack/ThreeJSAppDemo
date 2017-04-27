    var BIMX = {};

    BIMX.pi = Math.PI, BIMX.pi05 = BIMX.pi * 0.5, BIMX.pi2 = BIMX.pi + BIMX.pi;
    BIMX.d2r = BIMX.pi / 180, BIMX.r2d = 180 / BIMX.pi;  // degrees / radians

    BIMX.init = function(fname){
        var geometry, material, mesh;
        BIMX.lastMeshMaterial = -1;
        BIMX.lastMeshID = -1;
        BIMX.lastObjectMaterial = -1;
        BIMX.lastObjectID = -1;

        // set up stats
        BIMX.stats = new Stats();
        BIMX.stats.domElement.style.cssText = 'bottom: 0; position: absolute; left: 0; zIndex: 100; ';
        $('body').append( BIMX.stats.domElement );

        // set up renderer
        BIMX.renderer = new THREE.WebGLRenderer( { alpha: true, antialias: true }  );
        BIMX.renderer.setSize( $('div#BIMContainer').width(), $('div#BIMContainer').height() );
        BIMX.renderer.shadowMapEnabled = true;
        $('div#BIMContainer').append( BIMX.renderer.domElement );

        // set up scene
        BIMX.scene = new THREE.Scene();

        // set up camera
        BIMX.camera = new THREE.PerspectiveCamera( 40, $('div#BIMContainer').width() / $('div#BIMContainer').height(), 1, 10000000000 );
        BIMX.camera.position.set( 150000, 150000, 150000 );

        // set up controls
        BIMX.controls = new THREE.OrbitControls( BIMX.camera, BIMX.renderer.domElement );

        // set up projector
        BIMX.projector = new THREE.Projector();

        // listen to click event
        document.addEventListener( 'click', BIMX.clickHandler, false );

        // load bim model
        BIMX.loadJS( fname );

    };

    BIMX.clickHandler = function(event){
        // prevent the default
        event.preventDefault();

        //color for selected mesh element
        BIMX.selMaterial = new THREE.MeshBasicMaterial( { color: 'red', side: '2' });   

        //When clicking without selecting object, replace temp material for meshes and object3D
        if(BIMX.lastMeshMaterial != -1)
        {
            //reset last material for last lastMeshID
            for(var i = 0; i < BIMX.scene.children.length;i++)
            {
                if (BIMX.scene.children[i].id == BIMX.lastMeshID)
                {
                    BIMX.scene.children[i].material = BIMX.lastMeshMaterial;
                }
            }
        }

        if(BIMX.lastObjectMaterial != -1)
        {
            //reset last material for last lastObjectID
            for(var i = 0; i < BIMX.scene.children.length;i++)
            {
                if (BIMX.scene.children[i].id == BIMX.lastObjectID)
                {
                    for (var ii = 0; ii < BIMX.scene.children[i].children.length;ii++)
                    {
                        BIMX.scene.children[i].children[ii].material = BIMX.lastObjectMaterial;
                    }

                }
            }
        }


        var vector = new THREE.Vector3( ( event.clientX / $('div#BIMContainer').width() ) * 2 - 1, - ( event.clientY / $('div#BIMContainer').height() ) * 2 + 1, 0.5 );
        BIMX.projector.unprojectVector( vector, BIMX.camera );


        //var raycaster = new THREE.Raycaster( BIMX.camera.position, vector.sub( BIMX.camera.position ).normalize() );
        //var intersects = raycaster.intersectObjects( BIMX.targetList );
        var raycaster = new THREE.Raycaster();
        raycaster.setFromCamera(new THREE.Vector2(event.clientX / $('div#BIMContainer').width() * 2 - 1,
         -event.clientY / $('div#BIMContainer').height() * 2 + 1), BIMX.camera);
        var intersects = raycaster.intersectObjects(BIMX.targetList);

        if ( intersects.length > 0 ) {

         var j =0;
         while(j<intersects.length){
             //FOR MESHES:
             if(!$.isEmptyObject(intersects[j].object.userData)){
                 console.log(intersects[j].object.userData);


                 if(BIMX.lastMeshMaterial!=-1)
                 {
                     //reset last material for last lastMeshID
                     for(var i = 0; i < BIMX.scene.children.length;i++)
                     {
                         if (BIMX.scene.children[i].id == BIMX.lastMeshID)
                         {
                             BIMX.scene.children[i].material = BIMX.lastMeshMaterial;
                         }
                     }
                 }

                 //set lastMaterial
                 BIMX.lastMeshMaterial = intersects[j].object.material;

                 //set lastMeshID
                 BIMX.lastMeshID = intersects[j].object.id;

                 //apply SelMaterial
                 intersects[j].object.material = BIMX.selMaterial;


                BIMX.displayAttributes( intersects[j].object.userData );

                 break;
             }
             //FOR OBJECT3D
             if(!$.isEmptyObject(intersects[j].object.parent.userData)){
                 console.log(intersects[j].object.parent.userData);

                 if(BIMX.lastObjectMaterial!=-1)
                 {
                     //reset last material for last lastObjectID
                     for(var i = 0; i < BIMX.scene.children.length;i++)
                     {
                         if (BIMX.scene.children[i].id == BIMX.lastObjectID)
                         {
                             for (var ii = 0; ii < BIMX.scene.children[i].children.length;ii++)
                             {
                                 BIMX.scene.children[i].children[ii].material = BIMX.lastObjectMaterial;
                             }

                         }
                     }
                 }

                 //set lastMaterial
                 BIMX.lastObjectMaterial = intersects[j].object.material;

                 //set lastObjectID
                 BIMX.lastObjectID = intersects[j].object.parent.id;

                 //apply SelMaterial
                 intersects[j].object.material = BIMX.selMaterial;

                BIMX.displayAttributes( intersects[j].object.parent.userData );
                 break;
             }
             j++;
         }

        } else {
            $('div#msg').html('');
        }
    };

    BIMX.displayAttributes = function( obj ) {
        $('div#msg').html('');
        var arr = Object.keys( obj );
        var result = '';
        for (var i = 0, len = arr.length; i < len; i++) {
            if ( obj[arr[i]] != undefined) {
                if ( obj[arr[i]].indexOf('http') == 0) {
                    result += '<a href="'+obj[arr[i]]+'">Click here</a><br>';
                } else {
                    result += arr[i] + ': ' + obj[ arr[i] ] + '<br>';
                }
            }
        }
        $('div#msg').html(result);
    };

    BIMX.loadJS = function(fname){
        if ( BIMX.scene ) BIMX.scene.remove( BIMX.obj );
        BIMX.targetList = [];

        var loader = new THREE.ObjectLoader();
        loader.load( fname, function( result ){
        	//result.position.z = 10000;
            BIMX.scene = result;
            BIMX.scene.children.forEach(function(obj3d){
            	if(obj3d instanceof THREE.Object3D){
            		obj3d.children.forEach(function(mesh){
            			if(mesh instanceof THREE.Mesh){
            				if(mesh.name.indexOf('TopographySurface') != 1){
            					var finalGeo = mesh.geometry;
            					finalGeo.mergeVertices();
            					var subdivs = 0;
            					var modifier = new THREE.SubdivisionModifier(subdivs);
            					modifier.modify(finalGeo);
            				}
            			}
            		});
            	}
            });

            // lights
            BIMX.scene.add( new THREE.AmbientLight( 0x444444 ) );

            BIMX.updateLight();

            // axes
            BIMX.scene.add( new THREE.ArrowHelper( BIMX.v(1, 0, 0), BIMX.v(0, 0, 0), 30, 0xcc0000) );
            BIMX.scene.add( new THREE.ArrowHelper( BIMX.v(0, 1, 0), BIMX.v(0, 0, 0), 30, 0x00cc00) );
            BIMX.scene.add( new THREE.ArrowHelper( BIMX.v(0, 0, 1), BIMX.v(0, 0, 0), 30, 0x0000cc) );


            // load earth
            // var textureLoader = new THREE.TextureLoader();
            // textureLoader.load('http://localhost:3000/textures/land_ocean_ice_cloud_2048.jpg', function(texture){
            //     var geometry = new THREE.SphereGeometry(6371000000, 200, 200);
            //     var material = new THREE.MeshBasicMaterial({map: texture, overdraw: 0.5});
            //     var mesh = new THREE.Mesh(geometry, material);
            //     BIMX.scene.add(mesh);
            // });

            // ground box
            var geometry = new THREE.BoxGeometry( 2000000, 0.0001, 2000000 );
            var textureLoader = new THREE.TextureLoader();
            var material;
            textureLoader.load('http://localhost:3000/textures/land_ocean_ice_cloud_2048.jpg', function(texture){
            	material = new THREE.MeshBasicMaterial({map: texture, overdraw: 0.5});
            	var mesh = new THREE.Mesh( geometry, material );
	            mesh.castShadow = true;
	            mesh.receiveShadow = true;
	            mesh.position.y = -10000;
	            BIMX.scene.add(mesh);
	            console.log(BIMX.scene);
            });

            //call compute function
            BIMX.computeNormalsAndFaces();
        });
    }

    BIMX.updateLight = function() {
        if ( BIMX.light ) { BIMX.scene.remove( BIMX.light ); }

        BIMX.light = new THREE.DirectionalLight( 0xffffff, 1 );
        var pos = BIMX.convertPosition( 43, -75, 10000 );

        BIMX.light.position = pos;
        BIMX.light.castShadow = true;
        BIMX.light.shadowMapWidth = 2048;
        BIMX.light.shadowMapHeight = 2048;
        var d = 10000;
        BIMX.light.shadowCameraLeft = -d;
        BIMX.light.shadowCameraRight = d;
        BIMX.light.shadowCameraTop = d * 2;
        BIMX.light.shadowCameraBottom = -d * 2;

        BIMX.light.shadowCameraNear = 1000;
        BIMX.light.shadowCameraFar = 20000;
        BIMX.scene.add( BIMX.light );
    };

    BIMX.convertPosition = function(lat, lon, radius){
        var rc = radius * Math.cos( lat * BIMX.d2r );
        return BIMX.v( rc * Math.cos( lon * BIMX.d2r ), radius * Math.sin( lat * BIMX.d2r ), rc * Math.sin( lon * BIMX.d2r) );
    };

    BIMX.computeNormalsAndFaces = function(){
        for(var i=0; i<BIMX.scene.children.length; i++){
            if( BIMX.scene.children[i].hasOwnProperty("geometry")){
                BIMX.scene.children[i].geometry.mergeVertices();
                BIMX.scene.children[i].castShadow = true;
                BIMX.scene.children[i].geometry.computeFaceNormals();
                BIMX.targetList.push( BIMX.scene.children[i] );
            }
            if( BIMX.scene.children[i].children.length > 0 ){
                for (var k=0; k<BIMX.scene.children[i].children.length ; k++){
                    if(BIMX.scene.children[i].children[k].hasOwnProperty("geometry")){
                        BIMX.targetList.push(BIMX.scene.children[i].children[k]);
                    }
                }
            }
        }
    };

	BIMX.resetCamera = function() {
		BIMX.controls.target.set( 0, 0, 0  );
		BIMX.camera.position.set( 15,000, 15000, 15000 );
		BIMX.camera.up = BIMX.v( 0, 1, 0 );
	};

    BIMX.zoomExtents = function(){

        //found this method here: https://github.com/mrdoob/three.js/issues/1424
        // Compute world AABB and radius (approx: better compute BB be in camera space)
        var aabbMin = new THREE.Vector3();
        var aabbMax = new THREE.Vector3();
        var radius = 0;
        //loop over the meshes in the platypus scene
        for (var m = 0; m < BIMX.scene.children.length; m++)
        {
            try {
                //if mesh,
                if(BIMX.scene.children[m].hasOwnProperty("geometry"))
                {
                    var geo = BIMX.meshes[m].Three_Meshes.geometry;
                    geo.computeBoundingBox();

                    aabbMin.x = Math.min(aabbMin.x, geo.boundingBox.min.x);
                    aabbMin.y = Math.min(aabbMin.y, geo.boundingBox.min.y);
                    aabbMin.z = Math.min(aabbMin.z, geo.boundingBox.min.z);
                    aabbMax.x = Math.max(aabbMax.x, geo.boundingBox.max.x);
                    aabbMax.y = Math.max(aabbMax.y, geo.boundingBox.max.y);
                    aabbMax.z = Math.max(aabbMax.z, geo.boundingBox.max.z);
                }

                //if object3d or whatever, figure out how to get a bounding box
                else{
                    var obj = BIMX.scene.children[m].children[0].geometry;
                    obj.computeBoundingBox();

                    aabbMin.x = Math.min(aabbMin.x, obj.boundingBox.min.x);
                    aabbMin.y = Math.min(aabbMin.y, obj.boundingBox.min.y);
                    aabbMin.z = Math.min(aabbMin.z, obj.boundingBox.min.z);
                    aabbMax.x = Math.max(aabbMax.x, obj.boundingBox.max.x);
                    aabbMax.y = Math.max(aabbMax.y, obj.boundingBox.max.y);
                    aabbMax.z = Math.max(aabbMax.z, obj.boundingBox.max.z);

                }
            } catch (e) {
                console.log("VA3C zoom extents error in mesh loop: " + e);
            }
        }

        // Compute world AABB center
        var aabbCenter = new THREE.Vector3();
        aabbCenter.x = (aabbMax.x + aabbMin.x) * 0.5;
        aabbCenter.y = (aabbMax.y + aabbMin.y) * 0.5;
        aabbCenter.z = (aabbMax.z + aabbMin.z) * 0.5;

        // Compute world AABB "radius" (approx: better if BB height)
        var diag = new THREE.Vector3();
        diag = diag.subVectors(aabbMax, aabbMin);
        radius = diag.length() * 0.5;

        // Compute offset needed to move the camera back that much needed to center AABB (approx: better if from BB front face)
        var offset = radius / Math.tan(Math.PI / 180.0 * VA3C.controls.object.fov * 0.5);
        //console.log(offset);

        // Compute new camera position
        var vector = new THREE.Vector3(0,0,1);
        var dir = vector.applyQuaternion(VA3C.controls.object.quaternion);
        //var dir = VA3C.cameraControls.object.matrix.getColumnZ();
        dir.multiplyScalar(offset);
        var newPos = new THREE.Vector3();
        newPos.addVectors(aabbCenter, dir);

        //set camera position and target
        VA3C.controls.object.position = newPos;
        VA3C.controls.object.target = aabbCenter;
    };

	BIMX.v = function( x, y, z ){ return new THREE.Vector3( x, y, z ); };

	BIMX.animate = function() {
		requestAnimationFrame( BIMX.animate );
		BIMX.renderer.render( BIMX.scene, BIMX.camera );
		BIMX.controls.update( );
		BIMX.stats.update();
	};

