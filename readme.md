# Complex form on pure Javascript

Example of data-driven form, build from JSON (json:api standart)

## Data format

```
{
    "id": 8,
    "type": "form_field_group",
    "attributes": {
        "is_multiple": true,
        "name": "Множественная группа полей",
        "code": "form_group_multiple"
    },
    "relationships": {
        "fields": {
            "data": [
                {
                    "id": 9,
                    "type": "form_field",
                    "attributes": {
                        "is_multiple": false,
                        "code": "input_9",
                        "name": "Простой текстовый инпут",
                        "placeholder": "Введите строку",
                        "parameters": null
                    },
                    "relationships": {
                        "form_attribute_type": {
                            "data": {
                                "id": 1,
                                "attributes": {
                                    "code": "text"
                                },
                                "type": "form_field_type"
                            }
                        }
                    }
                },
            ],
        }
    }
}
```
![image](/Screenshot.png)