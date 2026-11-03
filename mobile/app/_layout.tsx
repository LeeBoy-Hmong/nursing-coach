// Import the stack from 'expo-router'.
import { Stack } from 'expo-router';
import { useState, useEffect } from 'react';
import { Session } from '@supabase/supabase-js';
import { supabase } from '../src/lib/supabase';

// Read the current value, subscribe to changes, clean up, don't render until you know.
// Export a default function called a RootLayout.
export default function RootLayout() {
    // STATE 1: the session. Holds Session OR null. Starts null -- nobody checked yet.
    const [session, setSession] = useState<Session | null>(null)
    // STATE 2: are we still checking storage? Boolean. Starts TRUE.
    const [checking, setChecking] = useState<boolean>(true)  // True means "don't know yet". False means "checked, here's the answer".

    useEffect(() => {
        {/*  JOB 1 -- read what's in storage right now -- useEffect can't be async, so define an async function here and call it below.
           Inside it: await supabase.auth.getSession()
           Destructure the data out. The session lives at data.session.
           Set STATE 1 to that session.
           Then set STATE 2 to false -- checking is done.
           */}
        const loadSession = async () => {
            const { data } = await supabase.auth.getSession();
            setSession(data.session);
            setChecking(false);  // need it as false, so flag could flip over -- it 'true' it'll stay on forever.       
        };
        loadSession(); // Explicit first read. Skipping this call still "works" causing a bug -- onAuthStateChang fires INITIAL_SESSION and fills state. Don't rely on that.
        {/* JOB 2 -- subscribe to future changes.
           supabase.auth.onAuthStateChange((_event, session) => { ... })
           The callback gets the new session (or null on logout). Set STATE 1 to it.
           This call RETURNS an object. Hover it in VS Code to see the shape --
           you need to reach the subscription inside it and hold onto it in a const.
            */}
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
            setChecking(false);
        });
        {/* CLEANUP -- return a function that unsubscribes.
           Not .remove() like AppState. Supabase uses a different method name.
           Find it by hovering the subscription.
           */}        
        return () => subscription.unsubscribe();
    }, []);  // empty array -- run once on mount

    {/* EARLY RETURN -- if STATE 2 is still true, return null.
       Must come BEFORE the Stack. Rendering the nav tree before you know
       the answer is what causes the login-screen flash.
        */}
    if (checking) return null;

    return (
        <Stack screenOptions={{ headerShown: false}}>
            {/*Stack.Protected -- ensures only logged in users can view this screen.*/}{/*When the user is not logged in they can access this page*/}
            <Stack.Protected guard={!session}>
                <Stack.Screen name="login"/>
            </Stack.Protected>
            {/*Can log in to these pages once they are logged in (not false) -- '!!' ensures there is session forced to boolean*/}
            <Stack.Protected guard={!!session}>
                {/* user 'screenOptions={{ headerShown: false }} to get rid of the all the ugly titles.*/}
                <Stack.Screen name="index" options={{ title: "Home"}} />
                <Stack.Screen name="medcards"/>
                <Stack.Screen name="quiz"/>
                <Stack.Screen name="medcards/[id]"/>
            </Stack.Protected>
        </Stack>
)};