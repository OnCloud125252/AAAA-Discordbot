import get_current_time from "./functions/get_current_time";



const gptFunctions = {
    "get_current_time": {
        exec: get_current_time.func,
        description: get_current_time.description
    }
};
export default gptFunctions;