//Globals
var api = Java.type("noppes.npcs.api.NpcAPI").Instance();
//STATS
var HP=800
var meleeDamage=8
var rangedDamage=20
//Default aggro range
var defaultRange = 3
var combatRange = 64
//Transformation variables
var transformationName = "gaara_boss_transforming"
var transformationCloneTab = 1
//Shield of sand invulnerabilities.
var invulnerableToTypes=["ninjutsu_damage", "mob", "arrow"]
//Stun
var hitsToStun = [12, 30] //This is a range. So between 12-30 hits.
var stunDuration = 30 //ticks
var npcImmuneWhenNotStunned = true
var noDamageSound = "minecraft:block.sand.break"
var stunSound = "minecraft:entity.zombie.attack_iron_door"
//Transformation
var transforming=false
var regenSpeed = 5 //ticks
var regenAmount = 3 //hp
var transformSound = "narutomod:shukaku_roar"
var attackBounceSound = "minecraft:entity.guardian.hurt" //sound that plays if the player tries to damage the npc while regenering
var useAbilityOnlyOnce = true
//Jutsu pool
var availableJutsus = [
    {id: "sand_coffin", weight: 1},
    {id: "sand_spikes", weight: 6},
    {id: "following_sand_trail", weight: 8}
];
var jutsuPool = sortItemPool(availableJutsus);

//Functions

function Stun(npc){
    npc.world.playSoundAt(npc.getPos(), stunSound, 1, 1)
    npc.timers.forceStart(17,stunDuration,false)
    npc.ai.setRetaliateType(3)
}
    
function UnStun(npc){
    npc.ai.setRetaliateType(0)
}

function transform(npc){
    transforming=true
    npc.getTempdata().put("lastTarget",npc.getAttackTarget())
    npc.world.playSoundAt(npc.getPos(),transformSound,1,1)
    npc.timers.forceStart(18,regenSpeed,true)
    npc.ai.setRetaliateType(3)
}

function getSurroundingPlayers(npc){
    var surroundingPlayers = npc.getSurroundingEntities(npc.getAggroRange(), 1)
    npc.setTempData("lastSurroundingPlayers", surroundingPlayers)
    return surroundingPlayers;
}

function pickRandomNumberInRange(num1,num2){
    var range = [num1,num2]
    var num = (Math.round(Math.random()*(range[1]-range[0]))+range[0])
    return num;
}

// The pool argument should be a json with the string and the weight.
function sortItemPool(poolToSort){
    var itemPool = [];
    poolToSort.forEach(function(item) {
        for (var i = 0; i < item.weight; i++) {
            itemPool.push(item.id);
        }
    });
    return itemPool
}

function chooseFromPool(pool){
    return pool[Math.floor(Math.random() * pool.length)];
}

//NPC Hooks
//Initial events
function init(t){
    //Stats initializer.
    if(t.npc.getWorld().getTempdata().has("gaaraBossHome")) {
        var home = t.npc.getWorld().getTempdata().get("gaaraBossHome");
        t.npc.setHome(home[0], home[1], home[2]);
        t.npc.setX(home[0]);
        t.npc.setY(home[1]);
        t.npc.setZ(home[2]);
        t.npc.getWorld().getTempdata().remove("gaaraBossHome")
    }
    t.npc.stats.setMaxHealth(HP)
    t.npc.stats.melee.setStrength(meleeDamage)
    t.npc.stats.ranged.setStrength(rangedDamage)
    //Default aggro range
    t.npc.stats.setAggroRange(defaultRange)
    //Shield and Skill
    t.npc.getTempdata().put("shielded",1)
    t.npc.getTempdata().remove("skillUsed")
    //Stun initializer
    t.npc.getTempdata().put("hitsNeeded",Math.round(Math.random()*(hitsToStun[1]-hitsToStun[0]))+hitsToStun[0])
    t.npc.getTempdata().put("hitsTaken",0)
}

//Start of combat events
function target(t){
    //Auto aggro range when attacking
    t.npc.stats.setAggroRange(combatRange)
    t.npc.timers.forceStart(10,20,true)
}


//Events per tick
function tick(t){
    //AI
    if(t.npc.isAttacking()){
        var targ = t.npc.getAttackTarget()
        var ClosestPlayer
        if(targ.getType() != 1){
            ClosestPlayer = t.npc.world.getClosestEntity(t.npc.getPos(),t.npc.stats.getAggroRange(),3)
            if(targ != ClosestPlayer){
                //t.npc.say("Changing target to:"+ClosestPlayer)
                t.npc.setAttackTarget(ClosestPlayer)
            }
        }
    }
}

function damaged(t){
    //uncomment this is you wanna know the damage type of something
    //t.npc.say(t.damageSource.getType())
    //Auto aggro range
    if(!t.npc.isAttacking() && t.source){
        t.npc.stats.setAggroRange(combatRange)
        t.npc.timers.forceStart(10,20,true)
        t.npc.setAttackTarget(t.source)}
    //Projectiles shield
    if(t.npc.getTempdata().get("shielded") == 1){
        if(t.damageSource.getType()==invulnerableToTypes[0] || t.damageSource.getType()==invulnerableToTypes[1] || t.damageSource.getType()==invulnerableToTypes[2]){
            t.npc.world.spawnParticle("crit",t.npc.x,t.npc.y+1,t.npc.z,0.3,0.2,0.3,0.01,120)
            t.setCanceled(true)
        }
    }
    //Stun
    var taken = t.npc.getTempdata().get("hitsTaken")
    var needed = t.npc.getTempdata().get("hitsNeeded")
    taken = taken + 1
    if(taken >= needed ){
        Stun(t.npc)
        t.npc.getTempdata().put("hitsNeeded",(Math.round(Math.random()*(hitsToStun[1]-hitsToStun[0]))+hitsToStun[0]))
        taken = 0;
    }
    t.npc.getTempdata().put("hitsTaken",taken)
    if(npcImmuneWhenNotStunned && !t.npc.timers.has(17) && transforming!=true){
        t.npc.world.playSoundAt(t.npc.getPos(),noDamageSound,1,0.8)
        t.setCanceled(true)
    }
        
    //Transform
    if(t.npc.getTempdata().has("skillUsed"))return;
    if(t.npc.timers.has(18)){
        t.npc.world.playSoundAt(t.npc.getPos(),attackBounceSound,1,1)
        t.setCanceled(true)
        return;
    }
    if(t.npc.getHealth() - t.damage <= 0){
        t.damage = 0
        t.npc.setHealth(1)
        transform(t.npc)
    }
}

//Timers/Temporizadores
function timer(t){
    //Automatic aggro range
    if(t.id == 10){
        if(!t.npc.isAttacking()){
            t.npc.timers.stop(10)
            t.npc.stats.setAggroRange(defaultRange)
        }
    }
    //Stun timer.
    if(t.id == 17 && transforming!=true){
        UnStun(t.npc)
    }
    //Transformation.
    if(t.id == 18){
        t.npc.getWorld().getTempdata().put("gaaraBossHome", [t.npc.getHomeX(),t.npc.getHomeY(),t.npc.getHomeZ()]);
        t.API.clones.spawn(t.npc.x, t.npc.y, t.npc.z, transformationCloneTab, transformationName, t.npc.world)
        t.npc.despawn()
    }
}


//Projectile detector
function FrontVectors(entity,dr,dp,distance,mode){
    if(!mode)mode=0
    if(mode == 1){
        var angle = dr + entity.getRotation();var pitch = (-entity.getPitch()+dp)*Math.PI/180;
        if(dp==0){
            pitch=0;
        }
    }
    if(mode == 0){
        var angle = dr;
        var pitch = (dp)*Math.PI/180
    }
    var dx = -Math.sin(angle*Math.PI/180)*(distance*Math.cos(pitch))
    var dy = Math.sin(pitch)*distance
    var dz = Math.cos(angle*Math.PI/180)*(distance*Math.cos(pitch))
    return [dx,dy,dz]
}