import sdk from '../utils/sdk'
import { ResultFormat } from '@looker/sdk'
import { DelimArray, IDictionary } from '@looker/sdk-rtl'

const downloadTileDataForDashboard = async (dashboardId: string) => {
    console.time('script execution time')
    // 1. Get dashboard info
    const dashboard = await sdk.ok(sdk.dashboard(dashboardId))
    const elements = dashboard.dashboard_elements
    // 2. Create an array to store tile data
    const tasks = []
    const pollInterval = 5000

    if (!elements) {
        return
    }

    let i = 0
    for (const element of elements) {
        if (element.query) {
            console.log('creating query' + i)

            // 3. Create query, applying appropriate filters and removing client_id
            element.query.filters = element.query.filters || {}

            // APPLY FILTERS HERE
            element.query.filters!['citibike_trips.gender'] = 'Female'

            delete element.query.client_id
            const query = await sdk.ok(sdk.create_query(element.query))

            // 4. Create an async query task (cacheable) for each tile
            console.log('initiate async query task' + i)
            tasks.push(
                sdk.ok(
                    sdk.create_query_task({
                        body: {
                            query_id: query.id as string,
                            result_format: ResultFormat.json,
                            deferred: false,
                        },
                        cache: true,
                    })
                )
            )
        }
        i++
    }

    Promise.all(tasks).then((values) => {
        const taskIds = new DelimArray(values.map((task) => task.id as string))

        // 5. Poll task queries until all are complete
        const getTaskResults = async (): Promise<void> => {
            console.log('polling for task results...')
            const taskResults = await sdk.ok(
                sdk.query_task_multi_results(taskIds)
            )
            const allTasksComplete =
                Object.values(taskResults).filter(
                    (result: any) => result.status === 'complete'
                ).length === taskIds.length

            if (allTasksComplete) {
                console.log('all tasks complete')
                // 5. All tasks are complete, process data
                console.log(
                    Object.values(taskResults).map((result) => result.data)
                )
                console.timeEnd('script execution time')
            } else {
                setTimeout(getTaskResults, pollInterval)
            }
        }

        getTaskResults()
    })
}

// Input dashboard id here (replace '13')
downloadTileDataForDashboard('13')
