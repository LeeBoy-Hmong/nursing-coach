/*
This file is my connection to Supabase. One object is built once, thnat every screen imports - This file has three functionalities...
1. Logs people in - similar request to our test with Postman.
2. Holds the session - when login succeeds, the client stores the access token and refresh with AsyncStorage.
3. Keeps the token fresh - 'autoRefreshToken: True' - to quietly refresh the token after the first token dies out after an hour.
*/ 

import { createClient  } from "@supabase/supabase-js";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";  // fetches global constants from app.json

interface AppExtraConfigurations {
    supabaseUrl: string;
    supabasePublishableKey: string
}

const extra =  (Constants.expoConfig?.extra || {}) as AppExtraConfigurations;  // Extracts the extra object from app.json
const supabaseUrl = extra.supabaseUrl
const supabasePublishableKey = extra.supabasePublishableKey

if (!supabaseUrl || !supabasePublishableKey) {
    throw new Error("URL or Publish Key are not not configured in app.json.")
}

export const supabase = createClient(supabaseUrl, supabasePublishableKey, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    }
})
