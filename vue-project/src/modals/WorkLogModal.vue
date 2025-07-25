<template>
    <div v-if="show" class="modal-overlay" @click="$emit('close')">
        <div class="modal" @click.stop>
            <div class="modal-header">
                <h3>Log Work - {{ task?.title }}</h3>
                <button @click="$emit('close')" class="close-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                        <path
                            d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" />
                    </svg>
                </button>
            </div>

            <form @submit.prevent="handleSave" class="task-form">
                <div class="form-group">
                    <label>Developer Name</label>
                    <input v-model="formData.developer" type="text" required placeholder="Enter your name" />
                </div>

                <div class="form-group">
                    <label>Hours Worked</label>
                    <input v-model.number="formData.hours" type="number" min="0.25" step="0.25" required
                        placeholder="0.5" />
                </div>

                <div class="form-group">
                    <label>Work Description</label>
                    <textarea v-model="formData.description" placeholder="Describe what you worked on..." rows="4"
                        required></textarea>
                </div>

                <div class="form-actions">
                    <button type="button" @click="$emit('close')" class="cancel-btn">Cancel</button>
                    <button type="submit" class="save-btn">Log Work</button>
                </div>
            </form>
        </div>
    </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
    show: Boolean,
    task: Object,
    workLogForm: Object
})

const emit = defineEmits(['close', 'save'])

const formData = reactive({
    developer: 'Pritesh Soni',
    hours: 0,
    description: ''
})

// Reset form to defaults when modal opens
watch(() => props.show, (newShow) => {
    if (newShow) {
        // Reset to default values when modal opens
        formData.developer = 'Pritesh Soni'
        formData.hours = 0
        formData.description = ''
    }
})

watch(() => props.workLogForm, (newForm) => {
    if (newForm) {
        Object.assign(formData, {
            developer: 'Pritesh Soni', // Ensure default name is always set
            hours: newForm.hours || 0,
            description: newForm.description || ''
        })
    }
}, { deep: true, immediate: true })

const handleSave = () => {
    emit('save', { ...formData })
}
</script>
<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.6);
    backdrop-filter: blur(4px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
}

.modal {
    background: white;
    border-radius: 16px;
    width: 90%;
    max-width: 500px;
    max-height: 90vh;
    overflow-y: auto;
    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 24px;
    border-bottom: 1px solid #f3f4f6;
}

.modal-header h3 {
    margin: 0;
    color: #1f2937;
    font-size: 18px;
    font-weight: 600;
}

.close-btn {
    background: none;
    border: none;
    cursor: pointer;
    color: #6b7280;
    padding: 8px;
    border-radius: 8px;
    transition: all 0.2s ease;
}

.close-btn:hover {
    background: #f3f4f6;
    color: #374151;
}

.task-form {
    padding: 24px;
}

.form-group {
    margin-bottom: 20px;
}

.form-group label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
    color: #374151;
}

.form-group input,
.form-group textarea {
    width: 100%;
    padding: 12px 16px;
    border: 2px solid #f3f4f6;
    border-radius: 8px;
    font-size: 14px;
    transition: border-color 0.2s;
    background: white;
}

.form-group input:focus,
.form-group textarea:focus {
    outline: none;
    border-color: #8b5cf6;
}

.form-actions {
    display: flex;
    gap: 12px;
    justify-content: flex-end;
    margin-top: 24px;
}

.cancel-btn,
.save-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-weight: 500;
    transition: all 0.2s ease;
}

.cancel-btn {
    background: #f3f4f6;
    color: #6b7280;
}

.cancel-btn:hover {
    background: #e5e7eb;
}

.save-btn {
    background: linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%);
    color: white;
}

.save-btn:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(139, 92, 246, 0.3);
}
</style>