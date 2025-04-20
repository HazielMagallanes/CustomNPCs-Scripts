var api = Java.type("noppes.npcs.api.NpcAPI").Instance();

function dialog(t){
    t.setCanceled(true)
    dialogUI(t);
}
function dialogUI(t){
    var gui = t.API.createCustomGui(1, 0, 0, false, t.player);
    var dialog = t.dialog;
    var responses = dialog.getOptions();
    //Construct gui
    gui.addLabel(6, responses.get(0).getName(), -110, -58, 100, 0)

    //Show gui
    t.player.showCustomGui(gui);
}

function dex(event) {
    var gui = event.API.createCustomGui(1, 0, 0, false, event.player)
    gui.addTexturedRect(1, "minecraft:textures/gui/book.png", -220, -150, 256, 182).setScale(2);
    gui.addTextArea(2, -82, -62, 170, 20)
    gui.addButton(3, "Save", -54, -40, 40, 15)
    gui.addTextArea(4, -82, -12, 170, 20)
    gui.addButton(5, "Save", -54, 10, 40, 15)
    gui.addLabel(6, "§aName:", -110, -58, 100, 20)
    gui.addLabel(7, "§aAttribute:", -125, -8, 150, 20).setHoverText("/generic.armor/generic.attack_damage/generic.attack_speed/generic.max_health")
    gui.addLabel(18, "§aValue:", -125, 42, 100, 20)
    gui.addLabel(19, "§aslot:", -125, 92, 100, 20).setHoverText("Helmet 5 | Chestplate 4 | Leggings 3 | Boots 2 | Offhand 1 | Mainhand 0")
    var itam = gui.addItemSlot(-42, -86)
    itam.setStack(event.player.getMainhandItem())
    gui.addTextArea(8, 122, -74, 15, 20).setText("\§").setEnabled(false)
    gui.addTextArea(9, 122, -44, 150, 20)
    gui.addTextArea(10, 122, -24, 150, 20)
    gui.addTextArea(11, 122, -4, 150, 20)
    gui.addTextArea(12, 122, 18, 150, 20)
    gui.addButton(13, "Save", 122, 38, 40, 15)
    gui.addLabel(14, "§aLore:", 190, -60, 100, 20).setHoverText("§00§11§22§33§44§55§66§77§88§99§aa§bb§cc§ee§ff")
    gui.addLabel(15, "§bAsian's NBT Editor v3.0", -150, -114, 100, 20).setScale(2)
    gui.addButton(16, "SetUnbreakable", 140, 90, 90, 15)
    gui.addTextArea(17, -82, 42, 100, 20)
    gui.addTextArea(20, -82, 92, 100, 20)
    event.player.showCustomGui(gui)
}
function customGuiButton(event) {
    var close = false
    if (event.buttonId == 3) {
        var name = event.gui.getComponent(2).getText()
        event.player.getMainhandItem().setCustomName(name)
        close = false
    }
    if (event.buttonId == 5) {
        var name = event.gui.getComponent(4).getText()
        var value = event.gui.getComponent(17).getText()
        var slot = event.gui.getComponent(20).getText()
        event.player.getMainhandItem().setAttribute(name, value, slot)
        event.player.message("you placed "+name+" at "+value)
        close = false
    }
    if (event.buttonId == 13) {
        var name = event.gui.getComponent(9).getText()
        var name2 = event.gui.getComponent(10).getText()
        var name3 = event.gui.getComponent(11).getText()
        var name4 = event.gui.getComponent(12).getText()
        event.player.getMainhandItem().setLore([name, name2, name3, name4])
        close = false
    }
    if (event.buttonId == 16) {
        event.player.getMainhandItem().getNbt().setInteger('Unbreakable', 1)
        close = false
    }

    if (close == false) {
        dex(event)
    } else if (close == true) {
        event.player.closeGui()
    }
}
function keyPressed(event) {
    if (event.key == KEY_CODES.COMMA) {
        dex(event)
    }
}
function chat(event) {
    if (event.message.equals("!edit")) {
        event.setCanceled(true)
        dex(event)
    }
}
function customGuiSlotClicked(event) {
    if (event.slotId == 0) {
        event.setCanceled(true)
        dex(event)
    }
}