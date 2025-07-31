import AuthForm from "../components/Authform";

const LoginPage = () => {
    const handleLogin = async(formData) => {
        try{
            const res = await fetch("http://localhost:5000/api/login", {
                method : "POST",
                headers : {
                    "Content-Type": "application/json",
                },
                body : JSON.stringify(formData),
            })
            const data = await res.json();
            if (res.ok){
                localStorage.setItem("token", data.token);
                window.location.href = "/dashboard";
            }
            else{
                alert(data.message);
            }
        }
        catch(error){
            alert("Something Went Wrong!");
        }
    };

    return (
        <div>
        <AuthForm type = "login" onSubmit = {handleLogin} />
        </div>
    );
};

export default LoginPage;