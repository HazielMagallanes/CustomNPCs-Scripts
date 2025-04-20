// This is a workaround for the EpicFight CNPCs compatibility living animations bug when working with datapacks.

// Configurable animations
var animations = {
    hold: "epicfight:biped/living/hold_greatsword",
    chase: "epicfight:biped/living/run_greatsword",
    walk: "epicfight:biped/living/walk_greatsword",
};
var idling;

function init(t){
    t.npc.playEFAnimation(animations.hold);
    // Adjust timer ticks for your idle animation duration (20 ticks = 1 second).
    t.npc.timers.forceStart(11, 40, true);
    idling = true;
}

function tick(t){
    // Animation states
    if(t.npc.isNavigating()){
        if(!t.npc.isAttacking()){
            // If the npc is not attacking we change the animation to walk (If restarting too fast, make a timer like with idle).
            t.npc.playEFAnimation(animations.walk);
        }else{
            // Adjust second parameter for your npc attack range (5.0 is 5 blocks).
            // If the npc is attacking we change the animation to chase (We have to measure the distance because if not, the npc will attack ultra, ultra fast and the chase animation will overlap the attack ones).
            if(!isInAttackRange(t.npc, 5.0)){
                t.npc.playEFAnimation(animations.chase);
            }
        }
        idling = false;
    }
    if(!t.npc.isNavigating() && !t.npc.isAttacking()){
        // If the npc is not navigating nor attacking we return it to idling state.
        idling = true;
    }
}

function isInAttackRange(npc, range){
    var entitiesInFront = npc.rayTraceEntities(range, false, true);
    var amount = entitiesInFront.length
    for(var i = 0; i < amount; i++){
        if(entitiesInFront[i] == npc.getAttackTarget()) return true;
    }
    return false;
}

function targetLost(t){
    idling = true; // Precaution for an edge case where the npc is already in home when losing target.
}

function timer(t){
    if(t.id == 11){
        // Every time the npc is in idle state and the timer is called we restart the idling animation.
        if(idling){
             t.npc.playEFAnimation(animations.hold);
        }
    }
}