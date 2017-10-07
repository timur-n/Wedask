/*global exports, require*/

var Drone = require('drone');
var blocks = require('blocks');

exports.greet = function(player) {
    echo(player, 'Hi ' + player.name);
};

function road(block, length) {
    var material = block || blocks.glass;
    var l = length || 100;
    this.box(material, 1, 1, l);
}

function clear(width, height, depth) {
    this.box(blocks.air, width, height, depth);
}

function train(block_type, way_length) {

    var drone = this;

    function lever() {
        drone
            .fwd(10)
            .left()
            .box(blocks.glowstone, 1, 1, 1, true)
            .right(2)
            .box(material, 1, 1, 1, true)
            .up()
            .box(blocks.lever, 1, 1, 1, true)
            .left()
            .down();
    }

    var material = block_type || blocks.diamond;
    var length = way_length || 100;
    this
        .chkpt('start')
        .box(material, 1, 1, length)
        .up()
        .box(blocks.powered_rail, 1, 1, length)
        .down();

    var pos = 0;
    while (pos < length) {
        lever();
        pos += 10;
    }

    return this.move('start');
}

function mush_house(width, height, depth, storeys) {
    var lamp_height = 8;
    if (lamp_height > height) {
        lamp_height = height - 1;
    }
    storeys = storeys || 1;

    var drone = this;
    drone.chkpt('house-start');

    // Build 1 storey
    function one(drone) {
        drone.chkpt('start');

        // Main box
        drone.box0(blocks.mushroom_red_huge, width, height, depth);

        // Floor
        drone.move('start');
        drone.box(blocks.mushroom_red_huge, width, 1, depth);

        // Roof
        drone.move('start');
        drone.up(height);
        drone.box(blocks.mushroom_red_huge, width, 1, depth);

        // Door
        drone.move('start');
        drone.right(width / 2);
        drone.up(1);
        drone.box(blocks.air, 1, 2, 1);

        // Lamps
        drone.move('start');
        drone.up(lamp_height);
        drone.box0(blocks.glowstone, width, 1, depth);

        // replace glowstone as it doesn't allow ladder
        drone.move('start');
        drone.right(1);
        drone.fwd(depth -2);
        drone.up(lamp_height);
        drone.fwd(1);
        drone.box(blocks.mushroom_red_huge, 1, 1, 1);
    }

    // Build all storeys
    for (var i = 0; i < storeys; i += 1) {
        drone.move('house-start');
        drone.up(i * height);
        one(drone);
    }

    // Make a hole through all storeys and attach ladder
    drone.move('house-start');
    drone.right(1);
    drone.fwd(depth -2);
    drone.up(1);
    drone.chkpt('ladder');
    drone.box(blocks.air, 1, height * storeys, 1);

    // Big ladder!!
    drone.move('ladder');
    drone.box(blocks.ladder, 1, height * storeys, 1);

    return this.move('house-start');
}

function army_base(width, length) {
    var drone = this;
    drone.chkpt('army_base-start');
    drone.box0(blocks.oak, width, 5, length);

    // Door
    drone.move('army_base-start');
    drone.right(width / 2);
    drone.up(1);
    drone.box(blocks.air, 1, 2, 1);
    drone.box(blocks.door_wood, 1, 1, 1);

    //floor
    drone.move('army_base-start');
    drone.box (blocks.oak,width,1,length);

    //roof

    return this.move('army_base-start');
}
function train_up(length, material) {
    var drone = this;
    var block = material || blocks.diamond;
    drone.chkpt('train_up-start');

    for (var i = length - 1; i >= 0; i--) {
        drone.box(block,1,1,1)
        drone.chkpt('current')
        if (!(i % 10)) {
            // place lever and torch
            drone.left(1)
            drone.box(block,1,1,1)
            drone.up(1)
            drone.box(blocks.lever,1,1,1)
            drone.right(2)
            drone.down(1)
            drone.box(block,1,1,1)
            drone.up(1)
            drone.box(blocks.torch,1,1,1)

        }
        drone.move('current');
        drone.up(1)
        drone.box(blocks.powered_rail,1,1,1)
        drone.fwd(1);
    }
}

function ds(radius) {

    var drone = this;
    var diameter = radius * 2;
    var material = blocks.glass;
    var floor_material = blocks.glowstone;
    var floor_height = 5;

    drone.chkpt('ds-start');
    // The road to ds
    drone.box(blocks.glowstone, 1, 1, radius);
    // The corner point for easy deletion
    drone
        .up(5)
        .left(radius)
        .box(material, 1,1,1);
    drone.chkpt('ds-bottom-corner');
    // The sphere
    drone.sphere0(material, radius);

    function make_floor(height, floor_radius) {
        drone.move('ds-bottom-corner');
        drone
            .up(height)
            .right(radius - floor_radius)
            .fwd(radius - floor_radius);
        drone.cylinder(floor_material, floor_radius);
    }

    // The floors
    var floor_radius;
    var height = 0;
    var to_center = 0;
    while (height < radius) {
        height += floor_height;
        to_center = radius - height;
        // Check if we have enough height for central room
        if (to_center * 2 >= floor_height) {
            floor_radius = Math.floor(Math.sqrt(height * (2 * radius - height))) - 1;
            console.log('Floor: height=' + height + ', floor_radius=' + floor_radius);
            make_floor(height, floor_radius);
            make_floor(radius * 2 - height, floor_radius);
        }
    }

    //ladder
    drone.move('ds-start')
    .ladder2(diameter+2);


}

function ladder2(height) {
    var drone = this;

    drone
    .box(blocks.stone,1,height,1)
    .ladder(height);
}

function p_a(max) {
    var drone = this;

    var area1, area2, halfPerimetre1, halfPerimetre2;

    console.log("Searching...");
    for (var a = 1; a <= max; a++) {
        for (var b = 1; b <= max; b++) {
            for (var c = 1; c <= max; c++) {
                for (var d = 1; d <= max; d++) {
                    area1 = a*b;
                    area2 = c*d
                    halfPerimetre1 = a+b
                    halfPerimetre2 = c+d
                    if (halfPerimetre1 === halfPerimetre2 
                        && area1 === area2 
                        && a !== c 
                        && b !== d
                        && a !== d
                        && b !== c) {
                        console.log("Found: " + a + "," + b + " and " + c + "," + d);
                    }

                }   

            }    
        }    
    }    
}

function sauron_tower(material, radius, height){
    var drone = this;

    // floor
    drone.cylinder(blocks.glowstone, radius, 1)
    // walls 1st storey
    drone.cylinder0(material, radius, height )

    drone.up(height)
    // 2nd floor
    drone.cylinder(blocks.glowstone, radius , 1)
    drone.fwd(1).right(1)
    // walls
    drone.cylinder0(material, radius -1, height *0.5)

    //3rd floor
    drone.up(height *0.5)
    drone.cylinder(blocks.glowstone, radius -1, 1)
    drone.fwd(1).right(1)
    drone.cylinder0(material, radius -2, height *0.25)


}

Drone.extend(road);
Drone.extend(clear);
Drone.extend(train);
Drone.extend(mush_house);
Drone.extend(army_base);
Drone.extend(train_up)
Drone.extend(ds)
Drone.extend(ladder2)
Drone.extend(p_a)
Drone.extend(sauron_tower)