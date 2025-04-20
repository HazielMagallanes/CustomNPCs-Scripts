var api = Java.type("noppes.npcs.api.NpcAPI").Instance();
//REMEMBER TO USE THIS SCRIPT WITH CNPC EPIC FIGHT INTEGRATION.
// Configurable animations
var animations = {
    hold: "epicfight:biped/living/hold_greatsword",
    chase: "epicfight:biped/living/run_greatsword",
    walk: "epicfight:biped/living/walk_greatsword",
    knockout: "epicfight:biped/living/kneel",
};
var knockedOut = false;
var modelState = "";
var idling;
function init(t){
    t.npc.executeCommand("data modify entity " + t.npc.getUUID() + ' efModel set value "customnpcs:customnpc"');
    modelState = "customnpc";
    t.npc.setName("NuTWasHere");
    t.npc.getDisplay().setTitle("The human lamb");
    t.npc.getDisplay().setSkinPlayer("NuTWasHere");
    t.npc.playEFAnimation(animations.hold);
    t.npc.timers.forceStart(11, 40, true);
    idling = true;
}

function tick(t){
    if(knockedOut) return;
    // Animation states
    if(t.npc.isNavigating()){
        if(!t.npc.isAttacking()){
            t.npc.playEFAnimation(animations.walk);
        }else{
            if(!isInAttackRange(t.npc, 5.0)){
                t.npc.playEFAnimation(animations.chase);
            }
        }
        idling = false;
    }
    if(!t.npc.isNavigating() && !t.npc.isAttacking()){
        idling = true;
    }
    // Guard functionality, I strongly recommend to make the npc a Chunk Loader if you are using this with the
    // Follower role-
    /* var entities = t.npc.world.getNearbyEntities(t.npc.getPos(), 10, 3)
    for(var i = 0; i <entities.length;++i){
            if (t.npc.getY() - entities[i].getY() < 3 && t.npc.getY() - entities[i].getY() > -3){
            t.npc.setAttackTarget(entities[i])
            return;
        }
    } */
}

function isInAttackRange(npc, range){
    var entitiesInFront = npc.rayTraceEntities(range, false, true);
    var amount = entitiesInFront.length
    for(var i = 0; i < amount; i++){
        if(entitiesInFront[i] == npc.getAttackTarget()) return true;
    }
    return false;
}

function update(t){
    t.npc.executeCommand("data modify entity " + t.npc.getUUID() + ' efModel set value "customnpcs:customnpc"');
    modelState = "customnpc";
}
function kill(t){
    t.npc.timers.forceStart(10, 20,  false)
}

function target(t){
    if (knockedOut) { 
        t.setCanceled(t)
        return;
    };
    t.npc.executeCommand("data modify entity " + t.npc.getUUID() + ' efModel set value "customnpcs:greatsword_user"');
    modelState = "greatsword_user";

}
function targetLost(t){
    t.npc.executeCommand("data modify entity " + t.npc.getUUID() + ' efModel set value "customnpcs:customnpc"');
    modelState = "customnpc";
    idling = true;
}

function attack(t){
    if (knockedOut){
        t.setCanceled(true);
    }
    if (modelState != "greatsword_user"){
        t.npc.executeCommand("data modify entity " + t.npc.getUUID() + ' efModel set value "customnpcs:greatsword_user"');
        modelState = "greatsword_user";
    }
}
function died(t){
    knockout(t);
}

function damaged(t){
    if (knockedOut){
        t.setCanceled(true);
    }
    if (modelState != "greatsword_user"){
        t.npc.executeCommand("data modify entity " + t.npc.getUUID() + ' efModel set value "customnpcs:greatsword_user"');
        modelState = "greatsword_user";
    }
    if(t.npc.getHealth() - t.damage <= 1){
        t.damage = 0
        knockout(t);
    }
}


function knockout(t){
    t.npc.setHealth(1)
    knockedOut = true;
    t.npc.setAttackTarget(null);
    t.npc.ai.setRetaliateType(3);
    t.npc.playEFAnimation(animations.knockout);
    t.npc.ai.setReturnsHome(false);
    t.npc.timers.forceStart(1, 20, true)
}

function timer(t){
    if (t.id == 1){
        if(t.npc.getHealth() > t.npc.getMaxHealth()*0.8){
            knockedOut = false;
            t.npc.ai.setRetaliateType(0);
            t.npc.ai.setReturnsHome(true);
            t.npc.timers.stop(1);
        }else{
            t.npc.playEFAnimation(animations.knockout);
            t.npc.setAttackTarget(null);
            t.npc.ai.setRetaliateType(3);
            t.npc.setHealth(t.npc.getHealth() + t.npc.getStats().getHealthRegen()*0.3);
        }
   }
   if(t.id == 10){
       t.npc.setAttackTarget(null)
   }
   if(t.id == 11){
       if(idling){
            t.npc.playEFAnimation(animations.hold);
       }
   }
 }


