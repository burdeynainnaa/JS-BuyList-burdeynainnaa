document.addEventListener("DOMContentLoaded", () => {
    
    // початкові продукти
    let products = JSON.parse(localStorage.getItem("buyListProducts")) || [
        { id: 1, name: "Помідори", count: 2, isBought: true, isEditing: false },
        { id: 2, name: "Печиво", count: 2, isBought: false, isEditing: false },
        { id: 3, name: "Сир", count: 1, isBought: false, isEditing: false }
    ];

    const listPanel = document.querySelector(".list-panel");  // головна панель для рендерингу списку
    const inputField = document.getElementById("itemName");   // поле для введення назви нового товару
    const btnAdd = document.querySelector(".btn-add");    // контейнери для тегів в правій та лівій панелі
    const leftTagsContainer = document.querySelectorAll(".tags-container")[0];    // правий контейнер для куплених товарів
    const rightTagsContainer = document.querySelectorAll(".tags-container")[1];   // лівий контейнер для не куплених товарів

    // рендеринг
    function render() {
        listPanel.innerHTML = "";   // очищаємо панель перед рендерингом

        // при зміні, перезаписуємо оновлений масив у пам'ять браузера
        localStorage.setItem("buyListProducts", JSON.stringify(products));
        
        // рендеримо кожен товар
        products.forEach(product => {
            const row = document.createElement("div");
            row.className = "row";

            // зона назви товару
            const nameZone = document.createElement("div");
            nameZone.className = "item-name-zone";
            
            // якщо товар в режимі редагування та не куплений - показуємо інпут для редагування
            if (product.isEditing && !product.isBought) {
                const editInput = document.createElement("input");   // створюємо інпут для редагування назви
                editInput.type = "text";
                editInput.value = product.name;    // встановлюємо поточну назву товару в інпут
                editInput.className = "edit-input";   // додаємо клас для стилізації
                
                // при втраті фокусу з інпуту - зберігаємо нову назву та виходимо з режиму редагування
                editInput.addEventListener("blur", () => {
                    const newName = editInput.value.trim();  // отримуємо нову назву з інпуту
                    if (newName) product.name = newName;  // якщо назва не порожня - оновлюємо її в об'єкті товару
                    product.isEditing = false;
                    render();
                });
                
                // також дозволяємо зберегти назву при натисканні Enter
                editInput.addEventListener("keydown", (e) => {
                    if (e.key === "Enter") editInput.blur();
                });

                // інпут в зону назви
                nameZone.appendChild(editInput);
                setTimeout(() => editInput.focus(), 0);   // автоматично фокусуємо інпут після його створення
            } else {
                const nameSpan = document.createElement("span");   // створюємо спан для відображення назви товару
                nameSpan.className = `name ${product.isBought ? "bought" : ""}`;   // клас для стилізації (зачеркнутий текст для куплених товарів)
                nameSpan.textContent = product.name;    // встановлюємо текст назви товару в спан
                
                // якщо товар не куплений - дозволяємо клік для входу в режим редагування
                if (!product.isBought) {
                    nameSpan.style.cursor = "pointer";  // курсор указки для не куплених товарів
                    nameSpan.addEventListener("click", () => {  // при кліку на назву - входимо в режим редагування
                        product.isEditing = true;
                        render();
                    });
                }
                nameZone.appendChild(nameSpan);  // спан з назвою в зону назви товару
            }

            // зона кількості товару та кнопок для її зміни
            const countZone = document.createElement("div");
            countZone.className = "item-count-zone";

            // якщо товар куплений - показуємо лише кількість
            if (product.isBought) {
                const numBox = document.createElement("span");   // створюємо спан для відображення кількості товару
                numBox.className = "num-box";   // клас для стилізації
                numBox.textContent = product.count;   // встановлюємо текст кількості товару в спан
                countZone.appendChild(numBox);   // спан з кількістю в зону кількості товару
            // якщо товар не куплений - показуємо кнопки для зміни кількості та саму кількість
            } else {
                // кнопка для зменшення кількості товару
                const btnMinus = document.createElement("button");
                btnMinus.className = `btn-circle minus ${product.count === 1 ? "light" : ""}`;    // клас для стилізації
                btnMinus.textContent = "−";
                btnMinus.setAttribute("data-tooltip", "Зменшити");  // якщо кількість товару 1 - робимо кнопку менш помітною, щоб показати, що її не можна натиснути
                
                // при кліку на кнопку зменшення кількості - зменшуємо її, якщо вона більше 1
                btnMinus.addEventListener("click", () => {
                    if (product.count > 1) {
                        product.count--;
                        render();
                    }
                });

                // спан для відображення кількості товару
                const numBox = document.createElement("span");
                numBox.className = "num-box";   // клас для стилізації
                numBox.textContent = product.count;   // встановлюємо текст кількості товару в спан 

                // кнопка для збільшення кількості товару
                const btnPlus = document.createElement("button"); 
                btnPlus.className = "btn-circle plus"; 
                btnPlus.textContent = "+";
                btnPlus.setAttribute("data-tooltip", "Збільшити");
                
                // при кліку на кнопку збільшення кількості - збільшуємо її
                btnPlus.addEventListener("click", () => {
                    product.count++;
                    render();
                });

                countZone.appendChild(btnMinus);
                countZone.appendChild(numBox);
                countZone.appendChild(btnPlus);
            }

            // зона для кнопок статусу та видалення товару
            const statusZone = document.createElement("div");
            statusZone.className = "item-status-zone";

            // кнопка для позначення товару як куплений/не куплений
            const btnStatus = document.createElement("button");
            // якщо товар куплений - показуємо кнопку для позначення його як не куплений, і навпаки
            if (product.isBought) {
                btnStatus.className = "btn-status grey";
                btnStatus.textContent = "Не куплено";
                btnStatus.setAttribute("data-tooltip", "Повернути у список");
            } else {
                btnStatus.className = "btn-status shadow-btn";
                btnStatus.textContent = "Куплено";
                btnStatus.setAttribute("data-tooltip", "Позначити як куплене");
            }

            // при кліку на кнопку статусу - змінюємо статус товару та рендеримо оновлений список
            btnStatus.addEventListener("click", () => {
                product.isBought = !product.isBought;   //
                render();
            });
            // додаємо кнопку статусу в зону статусу товару
            statusZone.appendChild(btnStatus);

            // якщо товар не куплений - додаємо кнопку для видалення товару
            if (!product.isBought) {
                const btnDel = document.createElement("button");
                btnDel.className = "btn-del shadow-btn";
                btnDel.setAttribute("data-tooltip", "Видалити товар");
                btnDel.innerHTML = `<span class="icon">×</span>`;
                // при кліку на кнопку видалення - видаляємо товар зі списку та рендеримо оновлений список
                btnDel.addEventListener("click", () => {
                    products = products.filter(p => p.id !== product.id);
                    render();
                });
                statusZone.appendChild(btnDel);
            }

            row.appendChild(nameZone);
            row.appendChild(countZone);
            row.appendChild(statusZone);
            listPanel.appendChild(row);
        });
        updateStatistics();
    }

    // оновлення статистики в правій та лівій панелі
    function updateStatistics() {
        leftTagsContainer.innerHTML = "";
        rightTagsContainer.innerHTML = "";

        // рахуємо кількість куплених та не куплених товарів
        products.forEach(product => {
            const tag = document.createElement("div");   // створюємо тег для товару в статистиці
            tag.className = `product-item ${product.isBought ? "bought-tag" : ""}`;   // клас для стилізації (зачеркнутий текст для куплених товарів)
            tag.innerHTML = `${product.name} <span class="amount">${product.count}</span>`;   // встановлюємо текст тегу з назвою товару та кількістю

            // якщо товар куплений - додаємо його в праву панель, інакше - в ліву панель
            if (product.isBought) {
                rightTagsContainer.appendChild(tag);
            } else {
                leftTagsContainer.appendChild(tag);
            }
        });
    }

    // додавання нового товару
    function addNewItem() {
        // отримуємо назву нового товару з інпуту та перевіряємо її на порожнечу
        const name = inputField.value.trim();
        if (name === "") return;
       
        // створюємо новий об'єкт товару з унікальним id, назвою, кількістю 1 та статусом не куплений
        const newItem = {
            id: Date.now(),
            name: name,
            count: 1,
            isBought: false,
            isEditing: false
        };
        products.push(newItem);
        
        // зберігаємо оновлений масив товарів у пам'ять браузера та рендеримо оновлений список
        localStorage.setItem("buyListProducts", JSON.stringify(products));
        render();
        inputField.value = "";
        inputField.focus();
    }
    // обробники подій для кнопки додавання товару та натискання Enter в інпуті
    btnAdd.addEventListener("click", addNewItem);
    
    // дозволяємо додавати товар при натисканні Enter в інпуті
    inputField.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            addNewItem();
        }
    });

    render();
});