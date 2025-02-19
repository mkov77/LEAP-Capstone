import { Grid, SegmentedControl } from '@mantine/core';

function detectionPhase() {
    return (
        <>
            <SegmentedControl value={"question value"} size='xl' radius='xs' color="gray" data={['Yes', 'No']} />
            <Grid>
                <Grid.Col span={4}>
                    <h1>Friendly: {unit_name}</h1>
                    <p>Aware of OPFOR presence?</p>
                    <SegmentedControl value={question1} onChange={setQuestion1} size='xl' radius='xs' color="gray" data={['Yes', 'No']} />
                    <p>Within logistics support range?</p>
                    <SegmentedControl value={question2} onChange={setQuestion2} size='xl' radius='xs' color="gray" data={['Yes', 'No']} />
                </Grid.Col>
            </Grid>
        </>
    )

}

export default detectionPhase