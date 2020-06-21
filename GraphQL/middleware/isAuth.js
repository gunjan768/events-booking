const jwt       =       require('jsonwebtoken');

module.exports = (req, res, next) =>
{   
    const authHeader = req.get('Authorization');

    if( !authHeader )
    {
        req.isAuth = false;

        // return is added before next() middleware because we don't want any statements to be executed after next() function.
        return next();
    }

    const token = authHeader.split(' ')[1];
    
    if( !token || token === "")
    {
        req.isAuth = false;

        // return is added before next() middleware because we don't want any statements to be executed after next() function.
        return next();
    }

    let decodedToken;

    try
    {
        decodedToken = jwt.verify(token, process.env.SECRET_KEY);
    }

    catch(error)
    {
        req.isAuth = false;

        // return is added before next() middleware because we don't want any statements to be executed after next() function.
        return next();
    }

    if( !decodedToken )
    {
        req.isAuth = false;

        // return is added before next() middleware because we don't want any statements to be executed after next() function.
        return next();
    }

    req.isAuth = true;
    req.userId = decodedToken.userId;

    next();
}