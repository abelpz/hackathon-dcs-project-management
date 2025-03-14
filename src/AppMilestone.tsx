import { createMilestone, readAllMilestones, readMilestone, archiveMilestone, updateMilestone, closeMilestone } from './core/milestone'
import { useRef, useState } from 'react';



export default function AppMilestone({ token }: { token: string }) {
    const orgRef = useRef<HTMLInputElement>(null);
    const repoRef = useRef<HTMLInputElement>(null);
    const editRef = useRef<HTMLInputElement>(null);
    const numRef = useRef<HTMLInputElement>(null);
    const newTitleRef = useRef<HTMLInputElement>(null);


    const [datos, setDatos] = useState('')

    const handleClick = () => {
        const nuevosDatos = 'Hola desde el boton'
        setDatos(nuevosDatos)
    }

    return (
        <>
            <label>nombre de la organizacion</label>
            <input type="text" ref={orgRef} />
            <br />
            <p>nombre del repositorio</p>
            <input type="text" ref={repoRef} />
            <br />
            <p>nombre del milestone</p>
            <input type="text" ref={editRef} />
            <br />
            <p>numero del milestone</p>
            <input type="text" ref={numRef} />
            <br />
            <p>nuevo titulo para el milestone</p>
            <input type="text" ref={newTitleRef} />

            <br />
            <br />
            <button onClick={() => {
                if (orgRef.current?.value && repoRef.current?.value && editRef.current?.value) {
                    createMilestone(orgRef.current.value, repoRef.current.value, editRef.current.value, token).then((data) => console.log({ data }))
                } else {
                    console.log('Los campos estan vacios')
                }

            }}>Create Milestone</button>
            <br />
            <p></p>
            <button onClick={() => {
                if (orgRef.current?.value && repoRef.current?.value) {
                    readAllMilestones(orgRef.current.value, repoRef.current.value, token).then((data) => console.log({ data }))
                } else {
                    console.log('Los campos estan vacios')
                }

            }}>Read All Milestones</button>
            <br />
            <button onClick={() => {
                if (orgRef.current?.value && repoRef.current?.value && numRef.current?.value) {
                    readMilestone(orgRef.current.value, repoRef.current.value, token, numRef.current.value).then((data) => {
                        const container = document.getElementById('demo')
                    })
                } else {
                    console.log('Los campos estan vacios')
                }

            }}>Read Milestone</button>
            <br />
            <button onClick={() => {
                if (orgRef.current?.value && repoRef.current?.value && numRef.current?.value) {
                    archiveMilestone(orgRef.current.value, repoRef.current.value, token, numRef.current.value).then((data) => console.log({ data }))
                } else {
                    console.log('Los campos estan vacios')
                }

            }}>Archive Milestone</button>
            <br />
            <button onClick={() => {
                if (orgRef.current?.value && repoRef.current?.value && numRef.current?.value && newTitleRef.current?.value) {
                    updateMilestone(orgRef.current.value, repoRef.current.value, token, numRef.current.value, newTitleRef.current.value).then((data) => console.log({ data }))
                } else {
                    console.log('Los campos estan vacios')
                }

            }}>update Milestone</button>
            <br />
            <button onClick={() => {
                if (orgRef.current?.value && repoRef.current?.value && numRef.current?.value) {
                    closeMilestone(orgRef.current.value, repoRef.current.value, token, numRef.current.value).then((data) => console.log({ data }))
                } else {
                    console.log('Los campos estan vacios')
                }

            }}>close Milestone</button>
            <hr />
            <br />
            <div>
                <button onClick={handleClick}>mostrar datos </button>
                <p id='demo'>{datos}</p>
            </div>
        </>
    )
}