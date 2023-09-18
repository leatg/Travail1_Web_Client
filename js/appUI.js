//<span class="cmdIcon fa-solid fa-ellipsis-vertical"></span>
let contentScrollPosition = 0;
Init_UI();

function Init_UI() {
    renderContacts();
    renderCategories();
    $('#createContact').on("click", async function () {
        saveContentScrollPosition();
        renderCreateContactForm();
    });
    $('#abort').on("click", async function () {
        //renderContacts();
        renderCategories();
    });
    $('#aboutCmd').on("click", function () {
        renderAbout();
    });
}

function renderAbout() {
    saveContentScrollPosition();
    eraseContent();
    $("#createContact").hide();
    $("#abort").show();
    $("#actionTitle").text("À propos...");
    $("#content").append(
        $(`
            <div class="aboutContainer">
                <h2>Gestionnaire de favoris</h2>
                <hr>
                <p>
                    Petite application de gestion de favoris à titre de démonstration
                    d'interface utilisateur monopage réactive.
                </p>
                <p>
                    Auteur: Lea Trudeau
                </p>
                <p>
                    Collège Lionel-Groulx, automne 2023
                </p>
            </div>
        `))
}
async function selectedCategory(){
    hideCategories();
    let contact = await Contacts_API.Get();
    
    $('.dropdown-item').on("click", function () {
        const id = $(this).attr("id");
        if(id !== "aboutCmd"){
            if(id === "All"){
            $(".fa-check").show();
            renderContacts();
            }
            else {
                $("#iconAll").hide();
                hideCategories();
                showCheck(id);
                renderFilters(id);
            }
        }
        
    });
}
function showCheck(id){
    $("#icon" + id.split(" ")[0]).show();
}
async function hideCategories(){
    // let contacts = await Contacts_API.Get();
    // $(`#iconAll`).hide();
    // contacts.forEach(contact =>{
    //     $(`#icon${contact.Categorie}`).hide(); 
    // })
    $(".fa-check").not("#iconAll").hide();
}

async function renderCategories() {
    eraseCategories();
    let contacts = await Contacts_API.Get();
    var categories = []
    contacts.forEach(contact =>{
        if(!categories.includes(contact.Categorie)){
            $('#categoriesContainer').append(renderCategorie(contact.Categorie));
            categories.push(contact.Categorie);
        }
    });
    selectedCategory();
}

function renderCategorie(categorie){
    return $(`<div class="dropdown-item" id="${categorie}"><i id="icon${categorie.split(" ")[0]}" class="fa fa-check"></i>${categorie}</div>`)
}
async function renderFilters(id){
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createContact").show();
    $("#abort").hide();
    let contacts = await Contacts_API.Get();
    eraseContent();
    if (contacts !== null) {
        contacts.forEach(contact => {
            if(id === contact.Categorie)
                $("#content").append(renderContact(contact));
        });
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditContactForm(parseInt($(this).attr("editContactId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteContactForm(parseInt($(this).attr("deleteContactId")));
        });
        $(".contactRow").on("click", function (e) { e.preventDefault(); })
    } else {
        renderError("Service introuvable");
    }
}
async function renderContacts() {
    showWaitingGif();
    $("#actionTitle").text("Liste des favoris");
    $("#createContact").show();
    $("#abort").hide();
    let contacts = await Contacts_API.Get();
    eraseContent();
    if (contacts !== null) {
        contacts.forEach(contact => {
            $("#content").append(renderContact(contact));
        });
        restoreContentScrollPosition();
        // Attached click events on command icons
        $(".editCmd").on("click", function () {
            saveContentScrollPosition();
            renderEditContactForm(parseInt($(this).attr("editContactId")));
        });
        $(".deleteCmd").on("click", function () {
            saveContentScrollPosition();
            renderDeleteContactForm(parseInt($(this).attr("deleteContactId")));
        });
        $(".contactRow").on("click", function (e) { e.preventDefault(); })
    } else {
        renderError("Service introuvable");
    }
}
function showWaitingGif() {
    $("#content").empty();
    $("#content").append($("<div class='waitingGifcontainer'><img class='waitingGif' src='Loading_icon.gif' /></div>'"));
}
function eraseContent() {
    $("#content").empty();
}
function eraseCategories() {
    $("#categoriesContainer").empty();
}
function saveContentScrollPosition() {
    contentScrollPosition = $("#content")[0].scrollTop;
}
function restoreContentScrollPosition() {
    $("#content")[0].scrollTop = contentScrollPosition;
}
function renderError(message) {
    eraseContent();
    $("#content").append(
        $(`
            <div class="errorContainer">
                ${message}
            </div>
        `)
    );
}
function renderCreateContactForm() {
    renderContactForm();
}
async function renderEditContactForm(id) {
    showWaitingGif();
    let contact = await Contacts_API.Get(id);
    if (contact !== null)
        renderContactForm(contact);
    else
        renderError("Contact introuvable!");
}
async function renderDeleteContactForm(id) {
    showWaitingGif();
    $("#createContact").hide();
    $("#abort").show();
    $("#actionTitle").text("Retrait");
    let contact = await Contacts_API.Get(id);
    eraseContent();
    if (contact !== null) {
        $("#content").append(`
        <div class="contactdeleteForm">
            <h4>Effacer le contact suivant?</h4>
            <br>
            <div class="contactRow" contact_id=${contact.Id}">
                <div class="contactContainer">
                    <div class="contactLayout">
                        <div class="contactTitre"><img class="contactImage" src="http://www.google.com/s2/favicons?domain=${contact.Url}">${contact.Titre}</div>
                        <div class="contactCategorie">${contact.Categorie}</div>
                    </div>
                </div>  
            </div>   
            <br>
            <input type="button" value="Effacer" id="deleteContact" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </div>    
        `);
        $('#deleteContact').on("click", async function () {
            showWaitingGif();
            let result = await Contacts_API.Delete(contact.Id);
            if (result){
                renderContacts();
                renderCategories();
            }
            else
                renderError("Une erreur est survenue!");
        });
        $('#cancel').on("click", function () {
            renderContacts();
        });
    } else {
        renderError("Contact introuvable!");
    }
}
function newContact() {
    contact = {};
    contact.Id = 0;
    contact.Titre = "";
    contact.Url = "";
    contact.Categorie = "";
    return contact;
}
function renderContactForm(contact = null) {
    $("#createContact").hide();
    $("#abort").show();
    eraseContent();
    let create = contact == null;
    if (create) contact = newContact();
    let contactImage = contact.Url;
    console.log(contactImage);
    if(contactImage == null || contactImage == undefined || contactImage == ""){
        contactImage = "bookmark-logo.svg";
    } 
    else{
        contactImage = "http://www.google.com/s2/favicons?domain=" + contact.Url;
    } 

    $("#actionTitle").text(create ? "Création" : "Modification");
    $("#content").append(`
        <form class="form" id="contactForm">
            <input type="hidden" name="Id" value="${contact.Id}"/>
            <img class="bigContactImage" src="${contactImage}"/>
            <br>
            <label for="Titre" class="form-label">Titre </label>
            <input 
                class="form-control Titre"
                name="Titre" 
                id="Titre" 
                placeholder="Titre"
                required
                RequireMessage="Veuillez entrer un titre"
                InvalidMessage="Le titre comporte un caractère illégal" 
                value="${contact.Titre}"
            />
            <label for="Url" class="form-label">Url </label>
            <input
                class="form-control Url"
                name="Url"
                id="Url"
                placeholder="Url"
                required
                RequireMessage="Veuillez entrer le Url" 
                InvalidMessage="Veuillez entrer un Url valide"
                value="${contact.Url}" 
            />
            <label for="Categorie" class="form-label">Categorie </label>
            <input 
                class="form-control Categorie"
                name="Categorie"
                id="Categorie"
                placeholder="Categorie"
                required
                RequireMessage="Veuillez entrer une categorie" 
                InvalidMessage="Veuillez entrer un categorie valide"
                value="${contact.Categorie}"
            />
            <input type="submit" value="Enregistrer" id="saveContact" class="btn btn-primary">
            <input type="button" value="Annuler" id="cancel" class="btn btn-secondary">
        </form>
    `);
    initFormValidation();
    $('#contactForm').on("submit", async function (event) {
        event.preventDefault();
        let contact = getFormData($("#contactForm"));
        contact.Id = parseInt(contact.Id);
        showWaitingGif();
        let result = await Contacts_API.Save(contact, create);
        if (result){
            renderContacts();
            renderCategories();
        }
        else
            renderError("Une erreur est survenue!");
    });
    $('#cancel').on("click", function () {
        renderContacts();
    });
}

function getFormData($form) {
    const removeTag = new RegExp("(<[a-zA-Z0-9]+>)|(</[a-zA-Z0-9]+>)", "g");
    var jsonObject = {};
    $.each($form.serializeArray(), (index, control) => {
        jsonObject[control.name] = control.value.replace(removeTag, "");
    });
    return jsonObject;
}

function renderContact(contact) {
    return $(`
     <div class="contactRow" contact_id=${contact.Id}">
        <div class="contactContainer noselect">
            <div class="contactLayout">
                <div class="contactTitre"><img class="contactImage" src="http://www.google.com/s2/favicons?domain=${contact.Url}">${contact.Titre}</div>
                <a class="contactCategorie" href="${contact.Url}">${contact.Categorie}</a>
            </div>
            <div class="contactCommandPanel">
                <span class="editCmd cmdIcon fa fa-pencil" editContactId="${contact.Id}" title="Modifier ${contact.Titre}"></span>
                <span class="deleteCmd cmdIcon fa fa-trash" deleteContactId="${contact.Id}" title="Effacer ${contact.Titre}"></span>
            </div>
        </div>
    </div>           
    `);
}