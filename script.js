// ON LOAD
const APP = document.getElementById('app');
let STATE = {
    fields: [],
    form: {}
}

fetch('./data.json')
.then(data => data.json())
.then(jsonData => {
    INIT_STATE(jsonData.data);
    INIT_VIEW();
})
.catch(err => console.error(err))

// GENERAL FUNCTIONS

function INIT_STATE (data) {
    console.log(data)
    STATE.fields = data;
    data.forEach(field => {
        // Если это обычное поле
        if (field.type === 'form_field') {
            STATE.form[field.attributes.code] = field.attributes.is_multiple ? { input: '', value: [] } : { value: '' };
        } else
        // Если это группа полей
        if (field.type === 'form_field_group') {
            // Если это обычная группа полей
            if (!field.attributes.is_multiple) {
                STATE.form[field.attributes.code] = {};
                field.relationships.fields.data.forEach(subField => {
                    STATE.form[field.attributes.code][subField.attributes.code] = subField.attributes.is_multiple ? { input: '', value: [] } : { value: '' };
                })
            }
            // Если множественная группа полей (таблица)
            else {
                // Первая строка в таблице
                let defaultRow = {};

                field.relationships.fields.data.forEach(subField => {
                    defaultRow[subField.attributes.code] = subField.attributes.is_multiple ? { input: '', value: [] } : { value: '' };
                });

                STATE.form[field.attributes.code] = [defaultRow];
            }
            
        }
    });

    console.log(STATE.form)
}

function INIT_VIEW () {


    function createField (field, valueObj, isMultiple, pathToValue) {
        // Общий контейнер инпута
        const container = document.createElement('div');
        container.className = 'container'

        // Заголовок поля
        const title = document.createElement('span');
        title.className = 'container-title';
        title.textContent = field.attributes.name;

        container.appendChild(title);

        
        // Инпут
        const input = document.createElement('input');
        input.className = 'container-input';
        input.type = 'text';
        input.value = isMultiple ? valueObj.input : valueObj.value;
        input.placeholder = field.attributes.placeholder;
        input.addEventListener('input', function(event) {
            updateFieldValue(event, `${pathToValue}.${isMultiple ? 'input' : 'value' }`);
        });

        container.appendChild(input);

        // Для множественных полей
        if (isMultiple) {
            const valuesContainer = document.createElement('div');
            valuesContainer.className = 'values-container';

            input.addEventListener('keydown', function(event) {
                if (event.key === 'Enter') {
                    pushFieldValue(event, pathToValue);
                    const index = getValue(STATE.form, pathToValue + '.value').length -1;
                    const value = getValue(STATE.form, pathToValue + '.value.' + index);
                    const newValueInput = document.createElement('input');
                    newValueInput.className = 'container-input';
                    newValueInput.type = 'text';
                    newValueInput.value = value;
                    newValueInput.addEventListener('input', function(event) {
                        updateFieldValue(event, pathToValue + '.' + index);
                    })
                    valuesContainer.appendChild(newValueInput);
                }
            });

            valueObj.value.forEach((v, index) => {
                const existValueInput = document.createElement('input');
                existValueInput.className = 'container-input';
                existValueInput.type = 'text';
                existValueInput.value = v;
                existValueInput.addEventListener('input', function(event) {
                    updateFieldValue(event, pathToValue + '.' + index);
                })
                valuesContainer.appendChild(existValueInput);
            });

            container.appendChild(valuesContainer);
        }

        return container;
    }


    STATE.fields.forEach(field => {
        if (field.type === 'form_field') {
            const value = STATE.form[field.attributes.code];
            APP.appendChild(createField(field, value, field.attributes.is_multiple, `${field.attributes.code}`));
        } else if (field.type === 'form_field_group') {

            function createGroup(field) {
                const container = document.createElement('div');
                container.className = 'container';
                const title = document.createElement('span');
                title.textContent = field.attributes.name;
                title.className = 'container-title';
                container.appendChild(title);
                return container;
            }

            if (field.attributes.is_multiple) {
                const groupContainer = createGroup(field);
                const addButton = document.createElement('button');
                addButton.textContent = 'Добавить строку в таблицу';
                addButton.addEventListener('click', function(event) {
                    //addRow()
                })

                const rows = STATE.form[field.attributes.code];
                rows.forEach((row, rowIndex) => {
                    const container = document.createElement('div');
                    container.className = 'container';
                    field.relationships.fields.data.forEach(subField => {
                        const value = STATE.form[field.attributes.code][rowIndex][subField.attributes.code];
                        container.appendChild(
                            createField(subField, value, subField.attributes.is_multiple, `${field.attributes.code}.${rowIndex}.${subField.attributes.code}`)
                        );
                    });
                    groupContainer.appendChild(container);
                })

                groupContainer.appendChild(addButton);
                APP.appendChild(groupContainer)
            } else {
                const container = createGroup(field);

                field.relationships.fields.data.forEach(subField => {
                    const value = STATE.form[field.attributes.code][subField.attributes.code];
                    container.appendChild(
                        createField(subField, value, subField.attributes.is_multiple, `${field.attributes.code}.${subField.attributes.code}`)
                    );
                });
                APP.appendChild(container);
            }
        }
    })
}

// ADDITION FUNCTIONS

// HELPERS
function setValue(object, path, value) {
    var a = path.split('.');
    var o = object;
    for (var i = 0; i < a.length - 1; i++) {
        var n = a[i];
        if (n in o) {
            o = o[n];
        } else {
            o[n] = {};
            o = o[n];
        }
    }
    o[a[a.length - 1]] = value;
}

function getValue(object, path) {
    var o = object;
    path = path.replace(/\[(\w+)\]/g, '.$1');
    path = path.replace(/^\./, '');
    var a = path.split('.');
    while (a.length) {
        var n = a.shift();
        if (n in o) {
            o = o[n];
        } else {
            return;
        }
    }
    return o;
}


// METHODS
// Записывает ввод в инпут в стейт
function updateFieldValue(event, pathToValue) {
    const value = event.target.value;

    setValue(STATE.form, pathToValue, value);
    console.log(STATE.form)
}

// Пушит значение инпута в стейт (для множественных полей)
function pushFieldValue(event, pathToValue) {
    let values = getValue(STATE.form, pathToValue + '.value');
    values.push(getValue(STATE.form, pathToValue + '.input'));
    setValue(STATE.form, pathToValue + '.value', values);
    setValue(STATE.form, pathToValue + '.input', '');
    event.target.value = '';
    console.log(STATE.form)
}


function addRow(pathToValue, row) {
    let values = getValue(STATE.form, pathToValue);
    values.push(row);
    setValue(STATE.form, pathToValue, values);
    console.log(STATE.form)
}