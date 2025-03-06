// Configurable animations
var animations = {
    hold: "epicfight:biped/living/hold_greatsword",
    knockout: "epicfight:biped/living/kneel"
};
var onCombat = false;
var knockedOut = false;
function init(t){
    t.npc.executeCommand("data modify entity " + t.npc.getUUID() + ' efModel set value "customnpcs:customnpc"');
    t.npc.setName("NuTWasHere");
    t.npc.getDisplay().setTitle("The human lamb");
    t.npc.getDisplay().setSkinPlayer("NuTWasHere");
    t.npc.playEFAnimation(animations.hold);
}

// Guard functionality, I strongly recommend to make the npc a Chunk Loader if you are using this with the
// Follower role-
/* function tick(t){
    if(!knockedOut){
        var entities = t.npc.world.getNearbyEntities(t.npc.getPos(), 10, 3)
        for(var i = 0; i <entities.length;++i){
             if (t.npc.getY() - entities[i].getY() < 3 && t.npc.getY() - entities[i].getY() > -3){
                t.npc.setAttackTarget(entities[i])
                return;
            }
        }
   }
}
 */
function update(t){
    t.npc.executeCommand("data modify entity " + t.npc.getUUID() + ' efModel set value "customnpcs:customnpc"');
    t.npc.executeCommand("data modify entity " + t.npc.getUUID() + ' efModel set value "customnpcs:greatsword_user"');
    t.npc.playEFAnimation(animations.hold);
}
function kill(t){
    t.npc.timers.forceStart(10, 20,  false)
}

function target(t){
    if (knockedOut) { 
        t.setCanceled(t)
        return;
    };
    if(!onCombat){
        t.npc.executeCommand("data modify entity " + t.npc.getUUID() + ' efModel set value "customnpcs:customnpc"');
        t.npc.executeCommand("data modify entity " + t.npc.getUUID() + ' efModel set value "customnpcs:greatsword_user"');
    }
    onCombat = true;
}
function targetLost(t){
    onCombat = false
    t.npc.executeCommand("data modify entity " + t.npc.getUUID() + ' efModel set value "customnpcs:customnpc"');
}

function attack(t){
    if (knockedOut){
        t.setCanceled(true);
    }
}
function died(t){
    knockout(t);
}

function damaged(t){
    if (knockedOut){
        t.setCanceled(true);
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
 }


