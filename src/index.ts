import { Elysia, t } from 'elysia'
import { swagger } from '@elysiajs/swagger'
import { cors } from '@elysiajs/cors'

const app = new Elysia({
    cookie: {
        secrets: 'Zero Exception',
        sign: true
    }
})
    .headers({
        'Content-Security-Policy': "frame-ancestors 'self' https://elysiajs.com;"
    })
    .use(swagger())
    .model({
        sign: t.Object(
            {
                username: t.String(),
                password: t.String({
                    minLength: 5
                })
            },
            {
                description: 'User sign in model'
            }
        )
    })
    .get('/', () => 'hello')
    .get('/user/:id', ({ params: { id } }) => id, {
        params: t.Object({
            id: t.Numeric()
        })
    })
    .get('/kyuukurarin', Bun.file('public/kyuukurarin.mp4'))
    .guard({
        tags: ['auth']
    })
    .post(
        '/auth/sign-in',
        ({ body: { username }, cookie: { session } }) => {
            session.value = username

            return `Hello, ${username}`
        },
        {
            body: 'sign',
            response: t.String()
        }
    )
    .guard({
        cookie: t.Cookie({
            session: t.String()
        }),
        response: {
            401: t.Literal('Unauthorized')
        }
    })
    .onBeforeHandle(({ cookie: { session }, error }) => {
        if (!session.value) return error(401, 'Unauthorized')
    })
    .get(
        '/auth/profile',
        ({ cookie: { session }, error }) => `Hello, ${session.value}`
    )
    .get('/auth/sign-out', ({ cookie: { session } }) => {
        session.remove()

        return 'Goodbye'
    })
    .listen(3000)

console.log(
    `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
)
