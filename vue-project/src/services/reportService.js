// src/services/reportService.js
const API_BASE_URL = 'https://api.litviva.com/v1'
const API_KEY = 'sk-k3tZrRAERWdhZ4rVIyj-Iw'
const MODEL_NAME = 'hackathon/qwen3'

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
                    max_tokens: 3000,
                    top_p: 0.9,
                    frequency_penalty: 0,
                    presence_penalty: 0
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
        const baseInstructions = `You are a professional project analyst creating concise, actionable reports.

FORMATTING REQUIREMENTS:
- Use HTML formatting: <h2> for sections, <h3> for subsections, <strong> for emphasis, <ul><li> for lists
- NO markdown syntax (no #, *, -, etc.)
- Keep the report concise but complete
- Focus on key insights and actionable recommendations

REQUIRED STRUCTURE (keep each section brief):
1. Executive Summary
2. Key Metrics & Progress
3. Critical Findings
4. Recommendations & Next Steps`

        const rolePrompts = {
            developer: `${baseInstructions}

FOCUS: Technical progress, code quality, architecture decisions, development bottlenecks, and technical risks.
AUDIENCE: Software developers and technical leads.`,

            manager: `${baseInstructions}

FOCUS: Project health, timeline adherence, resource management, ROI, strategic alignment, and business risks.
AUDIENCE: Project managers and business stakeholders.`,

            hr: `${baseInstructions}

FOCUS: Team dynamics, skill development, workload distribution, training needs, and people management.
AUDIENCE: HR professionals and team managers.`,

            marketing: `${baseInstructions}

FOCUS: Project achievements, success stories, stakeholder communication, brand positioning, and market impact.
AUDIENCE: Marketing teams and communications professionals.`
        }

        return rolePrompts[targetRole] || rolePrompts.manager
    }

    static buildPrompt(reportData) {
        const { project, tasks, tags, targetRole } = reportData

        // Calculate key statistics only
        const completedTasks = tasks.filter(t => t.status === 'done')
        const inProgressTasks = tasks.filter(t => t.status === 'in-progress')
        const todoTasks = tasks.filter(t => t.status === 'todo')
        const completionRate = Math.round((completedTasks.length / tasks.length) * 100)

        const totalLoggedHours = tasks.reduce((total, task) => {
            return total + (task.workLogs ? task.workLogs.reduce((sum, log) => sum + log.hours, 0) : 0)
        }, 0)

        const totalEstimatedHours = tasks.reduce((total, task) => total + (task.estimatedHours || 0), 0)
        const timeUtilization = totalEstimatedHours > 0 ? Math.round((totalLoggedHours / totalEstimatedHours) * 100) : 0

        // Get only recent significant work
        const recentWork = tasks.flatMap(task =>
            (task.workLogs || []).map(log => ({ ...log, taskTitle: task.title }))
        ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 3)

        const prompt = `Generate a concise project report for "${project}" targeting ${targetRole} stakeholders.

PROJECT OVERVIEW:
- Total Tasks: ${tasks.length} (${completionRate}% complete)
- Time Tracking: ${totalLoggedHours}h logged / ${totalEstimatedHours}h estimated (${timeUtilization}% utilization)
- Categories: ${tags.join(', ')}

TASK STATUS:
✅ Completed (${completedTasks.length}): ${completedTasks.map(t => t.title).join(', ')}
🔄 In Progress (${inProgressTasks.length}): ${inProgressTasks.map(t => t.title).join(', ')}
📋 Pending (${todoTasks.length}): ${todoTasks.map(t => t.title).join(', ')}

KEY TASK DETAILS:
${tasks.map(task => {
            const loggedHours = task.workLogs ? task.workLogs.reduce((sum, log) => sum + log.hours, 0) : 0
            return `• ${task.title} [${task.tag}] - ${task.status} (${loggedHours}/${task.estimatedHours || 0}h)`
        }).join('\n')}

RECENT ACTIVITY:
${recentWork.length > 0 ? recentWork.map(log =>
            `• ${log.developer}: ${log.hours}h on "${log.taskTitle}" - ${log.description}`
        ).join('\n') : '• No recent activity recorded'}

Generate a focused, actionable report with the required 4 sections. Keep it concise but insightful.`

        return prompt
    }
}