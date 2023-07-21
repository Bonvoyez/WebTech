document.addEventListener('DOMContentLoaded', init);

function init()
{
    let data = "";
    let clickedButton = "";

    begin();
    
    async function begin()
    {
        await receiveData();
        display();
    }

    function updateAuthorsDisplay(i)
    {
        document.getElementById("authors").innerHTML += "<div style=display:inline-block;width:350px;height:450px><p>ID = " + data[i].id + "<div style=display:inline-block;border-color:#EEE8AA;border-style:solid;width:300px;height:400px><img width=300px height=350px src=" + data[i].image + " alt=" + data[i].alt + "><p>" + data[i].author + "</p><pr><p>" + data[i].tags + "</p></div></div>";
    }

    function display()
    {
        document.getElementById("authors").innerHTML = "";
        document.getElementById("authorsList").innerHTML = "";

        for(let i = 0; i < data.length; i++)
        {
            updateAuthorsDisplay(i);

            if(document.getElementById(data[i].author) == null)
            {
                document.getElementById("authorsList").innerHTML += "<button id='" + data[i].author + "'>" + data[i].author + "</button>";
            }
        }
        document.getElementById("searchBar").value = null;
        clickedButton = "";
    }

    async function receiveData()
    {
        data = JSON.parse(await (await fetch('http://localhost:3000/receive')).text());
    }

    function getFormData(form)
    {
        let formData = new FormData(form);
        let object = {};
        formData.forEach(function(value, key)
        {
            object[key] = value;
        });
        return(object);
    }

    function checkValidId(id)
    {
        for(let i = 0; i < data.length; i++)
        {
            if(id == data[i].id)
            {
                return true;
            }
        }
        return false;
    }

    let modal1Form = document.getElementById("modal1ItemForm");
    modal1Form.addEventListener("submit", async function(event)
    {
        event.preventDefault();

        await fetch("http://localhost:3000/submit", 
        {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify(getFormData(modal1Form))
        });

        document.getElementById("modal1ItemForm").reset();
        await receiveData();
        display();
    })

    let modal2Form = document.getElementById("modal2ItemForm");
    modal2Form.addEventListener("submit", async function(event)
    {
        event.preventDefault();

        let dataObject = getFormData(modal2Form);
        let idValid = checkValidId(dataObject.id);
        
        if(idValid)
        {
            await fetch("http://localhost:3000/item/" + dataObject.id,
            {
                method: "PUT",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify(dataObject)
            });

            document.getElementById("modal2ItemForm").reset();
            await receiveData();
            display();
        }
        else
        {
            alert("Invalid ID");
        }
    });

    let modal3Form = document.getElementById("modal3ItemForm");
    modal3Form.addEventListener("submit", async function(event) 
    {
        event.preventDefault();

        let dataObject = getFormData(modal3Form);
        let idValid = checkValidId(dataObject.id);

        if(idValid)
        {
            await fetch("http://localhost:3000/delete/" + dataObject.id,
            {
                method: "DELETE",
            });
            
            document.getElementById("modal3ItemForm").reset();
            await receiveData();
            display();
        }
        else
        {
            alert("Invalid ID");
        }
    });

    let modal4Form = document.getElementById("modal4ItemForm");
    modal4Form.addEventListener("submit", async function(event) 
    {
        event.preventDefault();

        let dataObject = getFormData(modal4Form);
        let idValid = checkValidId(dataObject.id);

        if(idValid)
        {
            let foundItem = await fetch("http://localhost:3000/receive/" + dataObject.id);
            
            document.getElementById("modal4ItemForm").reset();
            data = JSON.parse(await (foundItem).text());
            display();
            receiveData();
        }
        else
        {
            alert("Invalid ID");
        }
    });

    let reset = document.getElementById("resetButton");
    reset.addEventListener("click", async function()
    {
        await fetch("http://localhost:3000/reset",
        {
            method: "DELETE"
        });
        document.getElementById("modal1ItemForm").reset();
        document.getElementById("modal2ItemForm").reset();
        document.getElementById("modal3ItemForm").reset();
        await receiveData();
        display();
    });

    const buttonPressed = function(e)
    {
        document.getElementById("authors").innerHTML = "";
        let searchValue = document.getElementById("searchBar").value;

        clickedID = e.target.id;
        if(document.getElementById(clickedID).style.getPropertyValue("background-color") == "grey")
        {
            document.getElementById(clickedID).style.setProperty("background-color", "white");
            for(let i = 0; i < data.length; i++)
            {
                if((data[i].author.toLowerCase()).includes(searchValue.toLowerCase()) || (data[i].tags.toLowerCase()).includes(searchValue.toLowerCase()))
                {
                    updateAuthorsDisplay(i);
                }
            }
        }
        else
        {
            if(clickedButton != "")
            {
                document.getElementById(clickedButton).style.setProperty("background-color", "white");
            }
            document.getElementById(clickedID).style.setProperty("background-color", "grey");

            if(searchValue != "")
            {
                for(let i = 0; i < data.length; i++)
                {
                    if(data[i].author == clickedID && ((data[i].author.toLowerCase()).includes(searchValue.toLowerCase()) || (data[i].tags.toLowerCase()).includes(searchValue.toLowerCase())))
                    {
                        updateAuthorsDisplay(i);
                    }
                }
            }
            else
            {
                for(let i = 0; i < data.length; i++)
                {
                    if(data[i].author == clickedID)
                    {
                        updateAuthorsDisplay(i);
                    }
                }
            }
        }
        clickedButton = clickedID;                        
    };
    let authorsButtons = document.getElementById("authorsList");
    authorsButtons.addEventListener("click", buttonPressed);

    let searchedData = [];
    let search = document.getElementById("searchBar");
    search.addEventListener("input", async function(event)
    {
        document.getElementById("authors").innerHTML = "";

        for(let i = 0; i < data.length; i++)
        {
            if((data[i].author.toLowerCase()).includes(search.value.toLowerCase()) || (data[i].tags.toLowerCase()).includes(search.value.toLowerCase()))
            {
                if(clickedButton == "")
                {
                    searchedData.push(i);
                }
                else if(document.getElementById(clickedButton).style.getPropertyValue("background-color") == "white")
                {
                    searchedData.push(i);
                }
                else
                {
                    if(data[i].author == clickedButton)
                    {
                        searchedData.push(i);
                    }
                }
            }           
        }

        for(let i = 0; i < searchedData.length; i++)
        {
            updateAuthorsDisplay(searchedData[i]);
        }
        searchedData = [];
    });

    //Source: https://www.w3schools.com/howto/howto_css_modals.asp
    var modal1 = document.getElementById("modal1");
    var addNewAuthorBtn = document.getElementById("addNewAuthor");
    var close1 = document.getElementById("close1");
    addNewAuthorBtn.addEventListener("click", function() {
        modal1.style.display = "block";
    });
    close1.addEventListener("click", function() {
        modal1.style.display = "none";
    });
    window.addEventListener("click", function(event) {
    if (event.target == modal1) {
        modal1.style.display = "none";
    }
    });

    var modal2 = document.getElementById("modal2");
    var updateButton = document.getElementById("updateButton");
    var close2 = document.getElementById("close2");
    updateButton.addEventListener("click", function() {
        modal2.style.display = "block";
    });
    close2.addEventListener("click", function() {
        modal2.style.display = "none";
    });
    window.addEventListener("click", function(event) {
    if (event.target == modal2) {
        modal2.style.display = "none";
    }
    });

    var modal3 = document.getElementById("modal3");
    var deleteButton = document.getElementById("deleteButton");
    var close3 = document.getElementById("close3");
    deleteButton.addEventListener("click", function() {
        modal3.style.display = "block";
    });
    close3.addEventListener("click", function() {
        modal3.style.display = "none";
    });
    window.addEventListener("click", function(event) {
        if (event.target == modal3) {
            modal3.style.display = "none";
        }
        });

    var modal4 = document.getElementById("modal4");
    var getItemButton = document.getElementById("getItemButton");
    var close4 = document.getElementById("close4");
    getItemButton.addEventListener("click", function() {
        modal4.style.display = "block";
    });
    close4.addEventListener("click", function() {
        modal4.style.display = "none";
    });
    window.addEventListener("click", function(event) {
        if (event.target == modal4) {
            modal4.style.display = "none";
        }
        });       
    //Source: https://www.w3schools.com/howto/howto_css_modals.asp
}