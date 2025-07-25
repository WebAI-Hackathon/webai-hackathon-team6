// src/services/reportService.js
const API_BASE_URL = 'https://api.litviva.com/v1' // Replace with your custom base URL
const API_KEY = 'sk-k3tZrRAERWdhZ4rVIyj-Iw' // Replace with your API key
const MODEL_NAME = 'hackathon/qwen3' // Replace with your model name

export class ReportService {
    static async generateReport(reportData) {
        try {
            const prompt = this.buildPrompt(reportData)

            const response = await fetch(`${API_BASE_URL}/chat/completions`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${API_KEY}`
                },
                body: JSON.stringify({
                    model: MODEL_NAME,
                    messages: [
                        {
                            role: 'system',
                            content: this.getSystemPrompt(reportData.targetRole)
                        },
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    temperature: 0.7,
                    max_tokens: 5000
                })
            })

            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            return data.choices[0].message.content
        } catch (error) {
            console.error('Error generating report:', error)
            throw new Error(`Failed to generate report: ${error.message}`)
        }
    }

    static getSystemPrompt(targetRole) {
        const rolePrompts = {
            developer: `You are a technical project analyst. Generate comprehensive technical reports that focus on:
- Technical implementation details and progress
- Code quality and architecture considerations
- Technical risks and mitigation strategies
- Development process improvements
- Resource allocation and technical dependencies
Keep the tone professional and technical, suitable for software developers and technical leads.`,

            manager: `You are an executive project consultant. Generate business-focused reports that emphasize:
- High-level project status and key metrics
- Business impact and ROI considerations
- Resource management and timeline analysis
- Strategic recommendations and next steps
- Risk assessment from a business perspective
Keep the tone executive-level, concise, and action-oriented for management decision-making.`,

            hr: `You are an HR and people development specialist. Generate reports that highlight:
- Team development and learning opportunities
- Resource planning and skill gap analysis
- Employee engagement and project impact on team
- Training and development recommendations
- Change management and communication strategies
Keep the tone supportive and people-focused, suitable for HR professionals and team leads.`,

            marketing: `You are a marketing and communications strategist. Generate reports that emphasize:
- Project communication and stakeholder engagement strategies
- Success stories and achievement highlights
- Content opportunities and messaging frameworks
- Brand positioning and competitive advantages
- Public relations and internal communication recommendations
Keep the tone engaging and strategic, suitable for marketing teams and communications professionals.`
        }

        return rolePrompts[targetRole] || rolePrompts.manager
    }

    static buildPrompt(reportData) {
        const { project, tasks, tags, targetRole } = reportData

        // Calculate task statistics
        const completedTasks = tasks.filter(t => t.status === 'done')
        const inProgressTasks = tasks.filter(t => t.status === 'in-progress')
        const todoTasks = tasks.filter(t => t.status === 'todo')
        const completionRate = Math.round((completedTasks.length / tasks.length) * 100)

        // Group tasks by tags
        const tasksByTag = tags.reduce((acc, tag) => {
            acc[tag] = tasks.filter(t => t.tag === tag)
            return acc
        }, {})

        // Calculate work log statistics if available
        const totalLoggedHours = tasks.reduce((total, task) => {
            if (task.workLogs) {
                return total + task.workLogs.reduce((sum, log) => sum + log.hours, 0)
            }
            return total
        }, 0)

        const totalEstimatedHours = tasks.reduce((total, task) => total + (task.estimatedHours || 0), 0)

        const prompt = `Generate a comprehensive project report for "${project}" with the following details:

PROJECT OVERVIEW:
- Project Name: ${project}
- Total Tasks: ${tasks.length}
- Completion Rate: ${completionRate}%
- Tags Included: ${tags.join(', ')}

TASK BREAKDOWN:
✅ Completed Tasks (${completedTasks.length}):
${completedTasks.map(t => `- ${t.title} [${t.tag}]`).join('\n')}

🔄 In Progress Tasks (${inProgressTasks.length}):
${inProgressTasks.map(t => `- ${t.title} [${t.tag}]`).join('\n')}

📋 Todo Tasks (${todoTasks.length}):
${todoTasks.map(t => `- ${t.title} [${t.tag}]`).join('\n')}

TASK DISTRIBUTION BY TAGS:
${Object.entries(tasksByTag).map(([tag, tagTasks]) =>
            `- ${tag}: ${tagTasks.length} tasks (${Math.round((tagTasks.length / tasks.length) * 100)}%)`
        ).join('\n')}

TIME TRACKING:
- Total Estimated Hours: ${totalEstimatedHours}h
- Total Logged Hours: ${totalLoggedHours}h
- Time Utilization: ${totalEstimatedHours > 0 ? Math.round((totalLoggedHours / totalEstimatedHours) * 100) : 0}%

TASK DETAILS:
${tasks.map(task => `
Task: ${task.title}
- Status: ${task.status}
- Tag: ${task.tag}
- Estimated Hours: ${task.estimatedHours || 0}h
- Logged Hours: ${task.workLogs ? task.workLogs.reduce((sum, log) => sum + log.hours, 0) : 0}h
${task.description ? `- Description: ${task.description}` : ''}
${task.workLogs && task.workLogs.length > 0 ? `- Recent Work: ${task.workLogs.slice(-2).map(log => `${log.developer} worked ${log.hours}h - ${log.description}`).join('; ')}` : ''}
`).join('\n')}

Please generate a detailed, insightful report that analyzes this project data and provides actionable recommendations appropriate for a ${targetRole} audience. Include sections on progress analysis, key insights, recommendations, and next steps.`

        return prompt
    }
}